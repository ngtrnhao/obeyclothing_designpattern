const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Delivery = require('../models/Delivery'); // Thêm dòng này
const paypal = require('@paypal/checkout-server-sdk');
const User = require('../models/User');
const Voucher = require('../models/Voucher');
const ShippingInfo = require('../models/ShippingInfo');

let environment = new paypal.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET);
let client = new paypal.core.PayPalHttpClient(environment);

exports.createPaypalOrder = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Giỏ hàng trống' });
    }

    const total = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: (total / 23000).toFixed(2)
        }
      }]
    });

    const order = await client.execute(request);
    res.json({ id: order.result.id });
  } catch (error) {
    console.error('Error creating PayPal order:', error);
    res.status(500).json({ message: 'Lỗi khi tạo đơn hàng PayPal', error: error.message });
  }
};

exports.completePaypalOrder = async (req, res) => {
  try {
    const { orderId, paypalDetails, shippingInfo } = req.body;
    const userId = req.user._id;

    console.log('Received shipping info in order completion:', shippingInfo);

    if (!shippingInfo.address || !shippingInfo.wardName || !shippingInfo.districtName || !shippingInfo.provinceName) {
      return res.status(400).json({ message: 'Thông tin địa chỉ giao hàng không đầy đủ' });
    }

    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!cart) {
      return res.status(404).json({ message: 'Không tìm thấy giỏ hàng' });
    }

    // Tạo hoặc cập nhật ShippingInfo
    let shippingInfoDoc = await ShippingInfo.findOneAndUpdate(
      { user: userId },
      {
        $set: {
          user: userId, // Thêm trường user vào đây
          fullName: shippingInfo.fullName,
          phone: shippingInfo.phone,
          address: shippingInfo.address,
          provinceId: shippingInfo.provinceId,
          provinceName: shippingInfo.provinceName,
          districtId: shippingInfo.districtId,
          districtName: shippingInfo.districtName,
          wardId: shippingInfo.wardId,
          wardName: shippingInfo.wardName
        }
      },
      { new: true, upsert: true }
    );

    const newOrder = new Order({
      user: userId,
      items: cart.items.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price,
        size: item.size,
        color: item.color
      })),
      totalAmount: cart.items.reduce((total, item) => total + item.quantity * item.product.price, 0),
      paypalOrderId: orderId,
      paypalDetails: paypalDetails,
      shippingInfo: shippingInfoDoc._id,
      status: 'paid'
    });

    await newOrder.save();

    // Cập nhật số lượng sản phẩm và xóa giỏ hàng
    for (let item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity }
      });
    }
    await Cart.findByIdAndDelete(cart._id);

    // Tạo đơn giao hàng mới
    const newDelivery = new Delivery({
      order: newOrder._id,
      shippingInfo: shippingInfoDoc._id,
      status: 'pending'
    });
    await newDelivery.save();

    res.status(200).json({ message: 'Đơn hàng đã được tạo và thanh toán thành công', order: newOrder });
  } catch (error) {
    console.error('Error completing PayPal order:', error);
    res.status(500).json({ message: 'Lỗi khi xử lý đơn hàng PayPal', error: error.message });
  }
};

exports.createOrder = async (req, res) => {
  try {
    console.log('Received order data:', req.body);
    const { cartItems, shippingInfo, totalAmount } = req.body;
    const userId = req.user._id;

    console.log('Received shipping info:', shippingInfo);

    const shippingAddress = `${shippingInfo.address}, ${shippingInfo.wardName || ''}, ${shippingInfo.districtName || ''}, ${shippingInfo.provinceName || ''}`.trim();

    if (!shippingInfo.provinceName || !shippingInfo.districtName || !shippingInfo.wardName) {
      console.log('Missing address information:', shippingInfo);
      return res.status(400).json({ message: 'Thông tin địa chỉ giao hàng không đầy đủ' });
    }

    // Kiểm tra số lượng tồn kho
    for (let item of cartItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Không tìm thấy sản phẩm với ID ${item.product}` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Sản phẩm ${product.name} không đủ số lượng trong kho` });
      }
    }

    // Xử lý voucher nếu có
    let discountAmount = 0;
    if (req.body.voucherId) {
      const voucher = await Voucher.findById(req.body.voucherId);
      if (voucher && voucher.isValid()) {
        if (totalAmount >= voucher.minPurchase) {
          if (voucher.discountType === 'percentage') {
            discountAmount = totalAmount * (voucher.discountValue / 100);
            if (voucher.maxDiscount) {
              discountAmount = Math.min(discountAmount, voucher.maxDiscount);
            }
          } else {
            discountAmount = voucher.discountValue;
          }
          voucher.usedCount += 1;
          await voucher.save();
        }
      }
    }

    const newOrder = new Order({
      user: userId,
      items: cartItems.map(item => ({
        product: item.product,
        quantity: item.quantity,
        price: item.price,
        size: item.size,
        color: item.color
      })),
      voucher: req.body.voucherId,
      discountAmount: discountAmount,
      totalAmount: totalAmount - discountAmount,
      shippingInfo: {
        fullName: shippingInfo.fullName,
        phone: shippingInfo.phone,
        address: shippingInfo.address,
        provinceId: shippingInfo.provinceId,
        districtId: shippingInfo.districtId,
        wardId: shippingInfo.wardId,
        provinceName: shippingInfo.provinceName,
        districtName: shippingInfo.districtName,
        wardName: shippingInfo.wardName
      },
      shippingAddress,
      status: 'pending'
    });

    console.log('New order object:', newOrder);

    await newOrder.save();

    // Cập nhật số lượng tồn kho
    for (let item of cartItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }

    // Xóa giỏ hàng sau khi đặt hàng thành công
    await Cart.findOneAndUpdate({ user: userId }, { $set: { items: [] } });

    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(400).json({ message: 'Lỗi khi tạo đơn hàng', error: error.message });
  }
};
