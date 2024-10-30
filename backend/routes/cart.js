const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Cart = require('../models/Cart');
const Product = require('../models/Product'); // Thêm dòng này
const Order = require('../models/Order'); // Thêm dòng này
const Voucher = require('../models/Voucher'); // Thêm dòng này

// Áp dụng authMiddleware cho tất cả các route của giỏ hàng
router.use(authMiddleware);

// Get user's cart
router.get('/', async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Add item to cart
router.post('/add', authMiddleware, async (req, res) => {
  try {
    const { productId, quantity, size, color } = req.body;
    const userId = req.user._id;

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === productId && item.size === size && item.color === color
    );

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity, size, color });
    }

    await cart.save();
    await cart.populate('items.product');
    res.status(200).json({ message: 'Sản phẩm đã được thêm vào giỏ hàng', items: cart.items });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: 'Lỗi khi thêm sản phẩm vào giỏ hàng', error: error.message });
  }
});

// Update cart item quantity
router.put('/update', async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Không tìm thấy giỏ hàng' });
    }

    const productIndex = cart.items.findIndex(item => item.product.toString() === productId);
    if (productIndex > -1) {
      cart.items[productIndex].quantity = quantity;
    }

    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Remove item from cart
router.delete('/remove/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Không tìm thấy giỏ hàng' });
    }

    cart.items = cart.items.filter(item => item.product.toString() !== productId);
    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Checkout
router.post('/checkout', async (req, res) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;
    
    // Validate payment method
    const validPaymentMethods = ['cod', 'paypal', 'banking'];
    if (!validPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({ 
        message: 'Phương thức thanh toán không hợp lệ' 
      });
    }

    const cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product')
      .populate('voucher')
      .lean();

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Giỏ hàng trống' });
    }

    // Tạo đơn hàng với phương thức thanh toán
    const order = new Order({
      user: req.user._id,
      items: cart.items.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price,
        size: item.size,
        color: item.color
      })),
      shippingAddress,
      paymentMethod,
      totalAmount: cart.totalAmount,
      shippingFee: 30000,
      voucher: cart.voucher,
      discountAmount: cart.discountAmount,
      finalAmount: cart.finalAmount,
      status: paymentMethod === 'cod' ? 'pending' : 'awaiting_payment'
    });

    await order.save();

    // Tạo hóa đơn
    const invoice = await createInvoiceFromOrder(order);

    // Sau khi tạo đơn hàng thành công và trước khi xóa giỏ hàng
    if (cart.voucher) {
      // Giảm lượt sử dụng của voucher
      await Voucher.findByIdAndUpdate(
        cart.voucher._id,
        { 
          $inc: { usageCount: 1 },
          // Tự động vô hiệu hóa voucher nếu đã hết lượt sử dụng
          $set: { 
            isActive: function() {
              return this.usageCount < this.usageLimit;
            }
          }
        }
      );
    }

    // Xóa giỏ hàng và voucher
    await Cart.findByIdAndUpdate(
      cart._id,
      { 
        $set: { 
          items: [],
          voucher: null,
          discountAmount: 0
        }
      }
    );

    // Tr��� về response tùy theo phương thức thanh toán
    if (paymentMethod === 'paypal') {
      // Chuyển hướng đến PayPal
      return res.json({
        redirectUrl: `/payment/paypal/${order._id}`,
        order
      });
    } else if (paymentMethod === 'banking') {
      // Trả về thông tin chuyển khoản
      return res.json({
        bankingInfo: {
          bankName: 'VietcomBank',
          accountNumber: '1234567890',
          accountName: 'SHOP NAME',
          amount: order.finalAmount,
          description: `Thanh toan don hang ${order._id}`
        },
        order
      });
    }

    // Mặc định cho COD
    res.status(201).json({
      message: 'Đặt hàng thành công',
      order,
      invoiceId: invoice._id
    });

  } catch (error) {
    console.error('Lỗi khi tạo đơn hàng:', error);
    res.status(500).json({ message: 'Lỗi khi tạo đơn hàng' });
  }
});

// Update cart item
router.put('/update/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity, size, color } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
      return res.status(404).json({ message: 'Không tìm thấy giỏ hàng' });
    }

    const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
    if (itemIndex > -1) {
      if (quantity) cart.items[itemIndex].quantity = quantity;
      if (size) cart.items[itemIndex].size = size;
      if (color) cart.items[itemIndex].color = color;
    }

    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Apply voucher
router.post('/apply-voucher', async (req, res) => {
  try {
    const { voucherCode, totalAmount } = req.body;
    const shippingFee = 30000;
    
    if (!voucherCode || !totalAmount) {
      return res.status(400).json({ 
        message: 'Thiếu thông tin voucher hoặc giá trị đơn hàng' 
      });
    }

    const voucher = await Voucher.findOne({ 
      code: voucherCode.toUpperCase(),
      isActive: true 
    });
    
    if (!voucher) {
      return res.status(400).json({ message: 'Không tìm thấy voucher' });
    }

    let discountAmount = 0;
    if (voucher.discountType === 'percentage') {
      discountAmount = totalAmount * (voucher.discountValue / 100);
      if (voucher.maxDiscount) {
        discountAmount = Math.min(discountAmount, voucher.maxDiscount);
      }
    } else {
      discountAmount = voucher.discountValue;
    }

    // Cập nhật cart với thông tin voucher
    await Cart.findOneAndUpdate(
      { user: req.user._id },
      { 
        voucher: voucher._id,
        discountAmount: discountAmount,
        finalAmount: totalAmount + shippingFee - discountAmount
      },
      { new: true }
    );

    res.json({
      discountAmount,
      shippingFee,
      finalAmount: totalAmount + shippingFee - discountAmount,
      voucher: voucher._id,
      message: 'Áp dụng voucher thành công'
    });
  } catch (error) {
    console.error('Lỗi server:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Clear voucher
router.post('/clear-voucher', async (req, res) => {
  try {
    const cart = await Cart.findOneAndUpdate(
      { user: req.user._id },
      { 
        $set: { 
          voucher: null,
          discountAmount: 0
        }
      },
      { new: true }
    );
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa voucher' });
  }
});

module.exports = router;
