const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Delivery = require('../models/Delivery');
const paypal = require('@paypal/checkout-server-sdk');
const User = require('../models/User');
const Voucher = require('../models/Voucher');
const ShippingInfo = require('../models/ShippingInfo');
const Invoice = require('../models/Invoice');

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

    console.log('Received shipping info:', shippingInfo);

    if (!shippingInfo || !shippingInfo.address || !shippingInfo.wardName || !shippingInfo.districtName || !shippingInfo.provinceName) {
      return res.status(400).json({ message: 'Thông tin địa chỉ giao hàng không đầy đủ' });
    }

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
      shippingInfo: {
        fullName: shippingInfo.fullName,
        phone: shippingInfo.phone,
        address: shippingInfo.address,
        provinceCode: shippingInfo.provinceCode,
        districtCode: shippingInfo.districtCode,
        wardCode: shippingInfo.wardCode,
        provinceName: shippingInfo.provinceName,
        districtName: shippingInfo.districtName,
        wardName: shippingInfo.wardName
      },
      status: 'paid'
    });

    await newOrder.save();
    console.log('New order created:', newOrder);

    // Create a new delivery record
    const newDelivery = new Delivery({
      order: newOrder._id,
      shippingInfo: { ...newOrder.shippingInfo },
      status: 'pending'
    });
    await newDelivery.save();

    // Create a unique invoice number
    const invoiceNumber = `INV-${Date.now()}`;

    // Create a new invoice
    const newInvoice = new Invoice({
      order: newOrder._id,
      customer: {
        name: newOrder.shippingInfo.fullName,
        address: `${newOrder.shippingInfo.address}, ${newOrder.shippingInfo.wardName}, ${newOrder.shippingInfo.districtName}, ${newOrder.shippingInfo.provinceName}`,
        phone: newOrder.shippingInfo.phone
      },
      items: newOrder.items,
      totalAmount: newOrder.totalAmount,
      invoiceNumber: invoiceNumber,
      status: 'issued'
    });
    await newInvoice.save();

    // Link the invoice to the order
    newOrder.invoice = newInvoice._id;
    await newOrder.save();

    // Clear the user's cart after successful payment
    await Cart.findByIdAndDelete(cart._id);

    res.status(200).json({ 
      message: 'Đơn hàng đã được tạo và thanh toán thành công', 
      order: newOrder,
      invoiceId: newInvoice._id
    });
  } catch (error) {
    console.error('Error completing PayPal order:', error);
    res.status(500).json({ message: 'Lỗi khi xử lý đơn hàng PayPal', error: error.message });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const { cartItems, selectedAddressId, totalAmount } = req.body;
    const userId = req.user._id;

    const shippingInfo = await ShippingInfo.findOne({ user: userId, 'addresses._id': selectedAddressId }, { 'addresses.$': 1 });
    if (!shippingInfo || !shippingInfo.addresses.length) {
      return res.status(404).json({ message: 'Không tìm thấy địa chỉ giao hàng' });
    }

    const selectedAddress = shippingInfo.addresses[0];

    console.log('Selected Address ID:', selectedAddressId); // Add this line in createOrder

    console.log('Retrieved Address:', selectedAddress); // Add this line after retrieving the address

    // Check stock availability
    for (let item of cartItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Không tìm thấy sản phẩm với ID ${item.product}` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Sản phẩm ${product.name} không đủ số lượng trong kho` });
      }
    }

    // Handle voucher if applicable
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
      totalAmount: totalAmount,
      shippingInfo: selectedAddress
    });
    await newOrder.save();

    console.log('Order Details:', newOrder); // Add this line before saving the order

    // Create a new Delivery record
    const newDelivery = new Delivery({
      order: newOrder._id,
      shippingInfo: { ...newOrder.shippingInfo },
      status: 'pending'
    });
    await newDelivery.save();

    // Link the Delivery record to the order
    newOrder.delivery = newDelivery._id;
    await newOrder.save();

    // Create a new Invoice
    const newInvoice = new Invoice({
      order: newOrder._id,
      customer: {
        name: newOrder.shippingInfo.fullName,
        address: `${newOrder.shippingInfo.address}, ${newOrder.shippingInfo.wardName}, ${newOrder.shippingInfo.districtName}, ${newOrder.shippingInfo.provinceName}`,
        phone: newOrder.shippingInfo.phone
      },
      items: newOrder.items,
      totalAmount: newOrder.totalAmount,
      status: 'issued'
    });
    await newInvoice.save();

    // Link the Invoice to the order
    newOrder.invoice = newInvoice._id;
    await newOrder.save();

    // Update stock quantities
    for (let item of cartItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }

    // Clear the user's cart after successful order
    await Cart.findOneAndUpdate({ user: userId }, { $set: { items: [] } });

    res.status(201).json({ message: 'Đơn hàng đã được tạo thành công', order: newOrder });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Lỗi khi tạo đơn hàng', error: error.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }
    
    // Kiểm tra quyền truy cập
    if (req.user.role !== 'admin' && order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Không có quyền truy cập đơn hàng này' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

