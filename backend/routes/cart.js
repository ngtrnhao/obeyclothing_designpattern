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
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Giỏ hàng trống' });
    }

    // Kiểm tra số lượng tồn kho
    for (let item of cart.items) {
      if (item.quantity > item.product.stock) {
        return res.status(400).json({ message: `Sản phẩm ${item.product.name} không đủ số lượng` });
      }
    }

    // Tạo đơn hàng mới
    const order = new Order({
      user: req.user._id,
      items: cart.items.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price
      })),
      totalAmount: cart.items.reduce((total, item) => total + item.quantity * item.product.price, 0)
    });

    // Cập nhật số lượng tồn kho
    for (let item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity }
      });
    }

    // Lưu đơn hàng và xóa giỏ hàng
    await order.save();
    await Cart.findByIdAndDelete(cart._id);

    res.json({ message: 'Đặt hàng thành công', orderId: order._id });
  } catch (error) {
    console.error('Error during checkout:', error);
    res.status(500).json({ message: 'Lỗi khi xử lý đơn hàng', error: error.message });
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
    const { voucherCode } = req.body;
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    
    if (!cart) {
      return res.status(404).json({ message: 'Không tìm thấy giỏ hàng' });
    }

    const voucher = await Voucher.findOne({ code: voucherCode, isActive: true });
    
    if (!voucher || !voucher.isValid()) {
      return res.status(400).json({ message: 'Mã giảm giá không hợp lệ hoặc đã hết hạn' });
    }

    const totalAmount = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    if (totalAmount < voucher.minPurchase) {
      return res.status(400).json({ message: `Đơn hàng phải có giá trị tối thiểu ${voucher.minPurchase}đ để áp dụng mã giảm giá này` });
    }

    let discountAmount;
    if (voucher.discountType === 'percentage') {
      discountAmount = totalAmount * (voucher.discountValue / 100);
      if (voucher.maxDiscount) {
        discountAmount = Math.min(discountAmount, voucher.maxDiscount);
      }
    } else {
      discountAmount = voucher.discountValue;
    }

    cart.voucher = voucher._id;
    cart.discountAmount = discountAmount;
    await cart.save();

    res.json({ message: 'Áp dụng mã giảm giá thành công', discountAmount, totalAfterDiscount: totalAmount - discountAmount });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi áp dụng mã giảm giá', error: error.message });
  }
});

module.exports = router;
