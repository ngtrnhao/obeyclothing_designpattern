const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Delivery = require('../models/Delivery');
const paypal = require('@paypal/checkout-server-sdk');
const User = require('../models/User');
const Voucher = require('../models/Voucher');
const ShippingInfo = require('../models/ShippingInfo');
const { createInvoiceFromOrder } = require('./invoiceController');
const { sendOrderConfirmationEmail } = require('../utils/emailService');

let environment = new paypal.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET);
let client = new paypal.core.PayPalHttpClient(environment);

exports.createPaypalOrder = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Giỏ hàng trống' });
    }

    // Tính tổng tiền với xử lý thập phân đúng cách
    const total = cart.items.reduce((sum, item) => 
      sum + (item.product.price * item.quantity), 0
    );

    // Sử dụng tỷ giá hối đoái từ biến môi trường
    const exchangeRate = process.env.USD_VND_RATE || 23000;
    const usdAmount = (total / exchangeRate).toFixed(2);

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: usdAmount
        },
        description: `Đơn hàng cho người dùng ${req.user._id}`
      }],
      application_context: {
        shipping_preference: 'NO_SHIPPING'
      }
    });

    const order = await client.execute(request);
    res.json({ 
      id: order.result.id,
      totalVND: total,
      totalUSD: usdAmount 
    });
  } catch (error) {
    console.error('Lỗi khi tạo đơn hàng PayPal:', error);
    res.status(500).json({ 
      message: 'Lỗi khi tạo đơn hàng PayPal', 
      error: error.message 
    });
  }
};

exports.completePaypalOrder = async (req, res) => {
  try {
    const { orderId, paypalDetails, shippingInfo } = req.body;
    const userId = req.user._id;

    const cart = await Cart.findOne({ user: userId })
      .populate('items.product')
      .populate('voucher')
      .lean();

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
      totalAmount: cart.items.reduce((total, item) => 
        total + item.quantity * item.product.price, 0
      ),
      shippingFee: 30000,
      voucher: cart.voucher ? cart.voucher._id : null,
      discountAmount: cart.discountAmount || 0,
      finalAmount: (cart.items.reduce((total, item) => 
        total + item.quantity * item.product.price, 0
      ) + 30000) - (cart.discountAmount || 0),
      paypalOrderId: orderId,
      paypalDetails: paypalDetails,
      shippingInfo: shippingInfo,
      paymentMethod: 'paypal',
      status: 'paid'
    });

    await newOrder.save();

    // Populate order with full details
    const populatedOrder = await Order.findById(newOrder._id)
      .populate({
        path: 'items.product',
        select: 'name price'
      })
      .populate('user', 'email')
      .lean();

    // Đảm bảo các thông tin quan trọng được giữ nguyên
    populatedOrder.shippingFee = newOrder.shippingFee;
    populatedOrder.totalAmount = newOrder.totalAmount;
    populatedOrder.discountAmount = newOrder.discountAmount;
    populatedOrder.finalAmount = newOrder.finalAmount;
    populatedOrder.shippingInfo = newOrder.shippingInfo;

    // Create invoice
    const invoice = await createInvoiceFromOrder(newOrder);

    // Create delivery record
    const newDelivery = new Delivery({
      order: newOrder._id,
      shippingInfo: { ...newOrder.shippingInfo },
      status: 'pending'
    });
    await newDelivery.save();

    // Clear cart
    await Cart.findByIdAndDelete(cart._id);

    // Send email with populated order data
    const user = await User.findById(userId);
    await sendOrderConfirmationEmail(user.email, populatedOrder, invoice);

    res.status(200).json({ 
      message: 'Đơn hàng đã được tạo và thanh toán thành công', 
      order: populatedOrder,
      invoiceId: invoice._id
    });
  } catch (error) {
    console.error('Error completing PayPal order:', error);
    res.status(500).json({ message: 'Lỗi khi xử lý đơn hàng PayPal' });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const { cartItems, shippingInfo, paymentMethod, voucherId } = req.body;
    
    // Validate payment method
    const validPaymentMethods = ['cod', 'paypal', 'banking'];
    if (!validPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({ 
        message: 'Phương thức thanh toán không hợp lệ' 
      });
    }

    const totalAmount = cartItems.reduce((sum, item) => 
      sum + item.price * item.quantity, 0
    );

    const shippingFee = 30000;
    let discountAmount = 0;
    let finalAmount = totalAmount + shippingFee;

    // Tính lại giá trị giảm giá nếu có voucher
    if (voucherId) {
      const voucher = await Voucher.findById(voucherId);
      if (voucher && voucher.isActive) {
        if (voucher.discountType === 'percentage') {
          discountAmount = totalAmount * (voucher.discountValue / 100);
          if (voucher.maxDiscount) {
            discountAmount = Math.min(discountAmount, voucher.maxDiscount);
          }
        } else {
          discountAmount = voucher.discountValue;
        }
        finalAmount = totalAmount + shippingFee - discountAmount;
      }
    }

    const order = new Order({
      user: req.user._id,
      items: cartItems,
      shippingInfo,
      paymentMethod,
      totalAmount,
      shippingFee,
      voucher: voucherId || null,
      discountAmount,
      finalAmount,
      status: paymentMethod === 'cod' ? 'pending' : 'awaiting_payment'
    });

    await order.save();

    // Cập nhật số lần sử dụng voucher
    if (voucherId) {
      await Voucher.findByIdAndUpdate(
        voucherId,
        {
          $inc: { usageCount: 1 },
          $push: { 
            usedBy: {
              user: req.user._id,
              usedAt: new Date()
            }
          }
        }
      );
    }

    res.status(201).json({
      message: 'Đặt hàng thành công',
      order
    });

  } catch (error) {
    console.error('Lỗi khi tạo đơn hàng:', error);
    res.status(500).json({ message: 'Lỗi khi tạo đơn hàng' });
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

// Thêm API để lấy danh sách phương thức thanh toán
exports.getPaymentMethods = async (req, res) => {
  try {
    const paymentMethods = [
      {
        id: 'cod',
        name: 'Thanh toán khi nhận hàng',
        description: 'Thanh toán bằng tiền mặt khi nhận hàng',
        icon: 'cash-icon',
        additionalInfo: 'Phí thu hộ: Miễn phí'
      },
      {
        id: 'paypal',
        name: 'PayPal',
        description: 'Thanh toán an toàn qua PayPal',
        icon: 'paypal-icon',
        additionalInfo: 'Chấp nhận thẻ Visa, MasterCard'
      },
      {
        id: 'banking',
        name: 'Chuyển khoản ngân hàng',
        description: 'Chuyển khoản qua ngân hàng nội địa',
        icon: 'bank-icon',
        additionalInfo: 'Thời gian xử lý: 1-24h',
        bankAccounts: [
          {
            bankName: 'VietcomBank',
            accountNumber: '1234567890',
            accountName: 'SHOP NAME',
            branch: 'Chi nhánh HCM'
          }
        ]
      }
    ];

    res.json(paymentMethods);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.createCodOrder = async (req, res) => {
  try {
    const { shippingInfo, cartItems, voucher, totalAmount, shippingFee, discountAmount, finalAmount } = req.body;

    if (!shippingInfo || !cartItems || !finalAmount) {
      return res.status(400).json({ message: 'Thiếu thông tin đơn hàng' });
    }

    const order = new Order({
      user: req.user._id,
      items: cartItems.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price,
        size: item.size,
        color: item.color
      })),
      shippingInfo,
      paymentMethod: 'cod',
      totalAmount,
      shippingFee:30000,
      voucher: voucher ? voucher._id : null,
      discountAmount,
      finalAmount,
      codAmount: finalAmount,
      status: 'pending',
      codStatus: 'pending'
    });

    await order.save();

    // Populate và tạo hóa đơn song song
    const [populatedOrder, invoice] = await Promise.all([
      Order.findById(order._id)
        .populate({
          path: 'items.product',
          select: 'name price'
        })
        .populate('user', 'email')
        .lean(),
      createInvoiceFromOrder(order)
    ]);

    // Clear cart ngay sau khi có order
    Cart.findOneAndUpdate(
      { user: req.user._id },
      { 
        $set: { 
          items: [],
          voucher: null,
          discountAmount: 0
        }
      }
    ).exec(); // Không cần await

    // Gửi email bất đồng bộ
    const user = await User.findById(req.user._id);
    sendOrderConfirmationEmail(user.email, populatedOrder, invoice)
      .catch(err => console.error('Error sending email:', err));

    // Trả response ngay
    res.status(201).json({
      message: 'Đặt hàng thành công',
      order: populatedOrder,
      invoiceId: invoice._id
    });

  } catch (error) {
    console.error('Lỗi khi tạo đơn hàng COD:', error);
    res.status(500).json({ message: 'Lỗi khi tạo đơn hàng' });
  }
};
