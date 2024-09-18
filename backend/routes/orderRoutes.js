const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const paypal = require('@paypal/checkout-server-sdk');
const Product = require('../models/Product');

// Cấu hình PayPal
let environment = new paypal.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET);
let client = new paypal.core.PayPalHttpClient(environment);

router.post('/create-paypal-order', authMiddleware, async (req, res) => {
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
          value: (total / 23000).toFixed(2) // Chuyển đổi từ VND sang USD
        }
      }]
    });

    const order = await client.execute(request);
    res.json({ id: order.result.id });
  } catch (error) {
    console.error('Error creating PayPal order:', error);
    res.status(500).json({ message: 'Lỗi khi tạo đơn hàng PayPal', error: error.message });
  }
});

router.post('/complete-paypal-order', authMiddleware, async (req, res) => {
  try {
    const { orderId, paypalDetails } = req.body;
    const userId = req.user._id;

    console.log('Received PayPal order completion request:', { orderId, paypalDetails, userId });

    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!cart) {
      return res.status(404).json({ message: 'Không tìm thấy giỏ hàng' });
    }

    const newOrder = new Order({
      user: userId,
      items: cart.items.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price
      })),
      totalAmount: cart.items.reduce((total, item) => total + item.quantity * item.product.price, 0),
      paypalOrderId: orderId,
      paypalDetails: paypalDetails,
      status: 'paid' // Đảm bảo giá trị này khớp với enum trong model
    });

    await newOrder.save();

    // Cập nhật số lượng sản phẩm
    for (let item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity }
      });
    }

    // Xóa giỏ hàng
    await Cart.findByIdAndDelete(cart._id);

    res.status(200).json({ message: 'Đơn hàng đã được tạo và thanh toán thành công', order: newOrder });
  } catch (error) {
    console.error('Error completing PayPal order:', error);
    res.status(500).json({ message: 'Lỗi khi xử lý đơn hàng', error: error.message });
  }
});

module.exports = router;