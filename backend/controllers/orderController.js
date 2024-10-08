const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Delivery = require('../models/Delivery'); // Thêm dòng này
const paypal = require('@paypal/checkout-server-sdk');
const User = require('../models/User');

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
    const userId = req.user._id; // Make sure you have this line

    console.log('Received shipping info in order completion:', shippingInfo);

    if (!shippingInfo.address || !shippingInfo.wardName || !shippingInfo.districtName || !shippingInfo.provinceName) {
      return res.status(400).json({ message: 'Thông tin địa chỉ giao hàng không đầy đủ' });
    }

    const finalShippingAddress = `${shippingInfo.address}, ${shippingInfo.wardName}, ${shippingInfo.districtName}, ${shippingInfo.provinceName}`.trim();

    console.log("Final shipping address:", finalShippingAddress);

    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!cart) {
      return res.status(404).json({ message: 'Không tìm thấy giỏ hàng' });
    }

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
      shippingInfo: shippingInfo,
      shippingAddress: finalShippingAddress,
      status: 'paid'
    });

    await newOrder.save();

    for (let item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity }
      });
    }

    await Cart.findByIdAndDelete(cart._id);

    const newDelivery = new Delivery({
      order: newOrder._id,
      shippingAddress: finalShippingAddress,
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

    // Kiểm tra và sử dụng tên địa chỉ từ shippingInfo
    const shippingAddress = `${shippingInfo.address}, ${shippingInfo.wardName || ''}, ${shippingInfo.districtName || ''}, ${shippingInfo.provinceName || ''}`.trim();

    if (!shippingInfo.provinceName || !shippingInfo.districtName || !shippingInfo.wardName) {
      console.log('Missing address information:', shippingInfo);
      return res.status(400).json({ message: 'Thông tin địa chỉ giao hàng không đầy đủ' });
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
      totalAmount,
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

    // Xóa giỏ hàng sau khi đặt hàng thành công
    await Cart.findOneAndUpdate({ user: userId }, { $set: { items: [] } });

    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(400).json({ message: 'Lỗi khi tạo đơn hàng', error: error.message });
  }
};