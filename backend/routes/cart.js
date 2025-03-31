const express = require('express');
const router = express.Router();
// const authMiddleware = require('../middleware/authMiddleware');
const { authChainMiddleware } = require('../middleware/chainMiddleware');
const Cart = require('../models/Cart');
const Product = require('../models/Product'); 
const Order = require('../models/Order'); 
const Voucher = require('../models/Voucher'); 
const voucherController = require('../controllers/voucherController');

// Áp dụng authMiddleware cho tất cả các route của giỏ hàng
router.use(authChainMiddleware);

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
router.post('/add', authChainMiddleware, async (req, res) => {
  try {
    const { productId, quantity, size, color } = req.body;
    const userId = req.user._id;

    // Tìm sản phẩm
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }

    // Kiểm tra số lượng tồn kho
    if (product.stock < quantity) {
      return res.status(400).json({ 
        message: `Số lượng yêu cầu (${quantity}) vượt quá số lượng trong kho (${product.stock})`
      });
    }

    // Tìm hoặc tạo giỏ hàng
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ 
        user: userId, 
        items: [],
        voucher: null,
        discountAmount: 0
      });
    }

    // Reset voucher
    cart.voucher = null;
    cart.discountAmount = 0;

    // Xử lý thêm sản phẩm
    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === productId && 
      item.size === size && 
      item.color === color
    );

    // Kiểm tra tổng số lượng khi thêm vào giỏ hàng
    const newQuantity = existingItemIndex > -1 
      ? cart.items[existingItemIndex].quantity + quantity
      : quantity;

    if (product.stock < newQuantity) {
      return res.status(400).json({
        message: `Tổng số lượng yêu cầu (${newQuantity}) vượt quá số lượng trong kho (${product.stock})`
      });
    }

    // Cập nhật hoặc thêm mới vào giỏ hàng
    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      cart.items.push({ 
        product: productId, 
        quantity, 
        size, 
        color
      });
    }

    // Tính lại tổng tiền
    await cart.populate('items.product');
    const totalAmount = cart.items.reduce((sum, item) => 
      sum + (item.product.price * item.quantity), 0
    );
    cart.finalAmount = totalAmount + 30000; // Cộng phí ship

    await cart.save();

    res.status(200).json({
      message: 'Sản phẩm đã được thêm vào giỏ hàng',
      cart: {
        items: cart.items,
        finalAmount: cart.finalAmount,
        discountAmount: 0,
        voucher: null
      }
    });

  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ 
      message: 'Lỗi khi thêm sản phẩm vào giỏ hàng', 
      error: error.message 
    });
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
    const validPaymentMethods = ['cod', 'paypal', 'banking', 'vnpay'];
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

    // Sau khi tạo đơn hàng thành công
    if (cart.voucher) {
      try {
        const voucher = await Voucher.findById(cart.voucher._id);
        if (voucher && voucher.isActive) {
          // Kiểm tra lại một lần nữa trước khi cập nhật
          const userHasUsed = voucher.usedBy.some(
            usage => usage.user.toString() === req.user._id.toString()
          );

          if (!userHasUsed && voucher.usedCount < voucher.usageLimit) {
            // Cập nhật voucher
            const updatedVoucher = await Voucher.findByIdAndUpdate(
              voucher._id,
              {
                $inc: { usedCount: 1 },
                $push: {
                  usedBy: {
                    user: req.user._id,
                    orderId: order._id, // Thêm orderId để theo dõi
                    usedAt: new Date()
                  }
                }
              },
              { new: true }
            );

            // Kiểm tra và vô hiệu hóa nếu đã hết lượt
            if (updatedVoucher.usedCount >= updatedVoucher.usageLimit) {
              await Voucher.findByIdAndUpdate(
                voucher._id,
                { isActive: false }
              );
            }

            // Cập nhật lại order với thông tin voucher đã sử dụng
            await Order.findByIdAndUpdate(
              order._id,
              {
                voucher: voucher._id,
                discountAmount: cart.discountAmount,
                finalAmount: cart.finalAmount
              }
            );
          }
        }
      } catch (error) {
        console.error('Lỗi khi cập nhật voucher:', error);
        // Không throw error để không ảnh hưởng đến việc tạo đơn hàng
      }
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

    // Tr về response tùy theo phương thức thanh toán
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
    const cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product');
    
    if (!cart) {
      return res.status(404).json({ message: 'Không tìm thấy giỏ hàng' });
    }

    const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm trong giỏ hàng' });
    }

    // Kiểm tra số lượng tồn kho
    const product = await Product.findById(cart.items[itemIndex].product._id);
    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }

    if (quantity && quantity > product.stock) {
      return res.status(400).json({ 
        message: `Chỉ còn ${product.stock} sản phẩm trong kho`,
        availableStock: product.stock
      });
    }

    // Reset voucher khi cập nhật số lượng
    cart.voucher = null;
    cart.discountAmount = 0;

    if (quantity) cart.items[itemIndex].quantity = quantity;
    if (size) cart.items[itemIndex].size = size;
    if (color) cart.items[itemIndex].color = color;

    // Tính lại finalAmount
    cart.finalAmount = cart.items.reduce((sum, item) => 
      sum + (item.product.price * item.quantity), 0
    ) + 30000;

    await cart.save();
    
    res.json({
      message: 'Cập nhật giỏ hàng thành công',
      cart: {
        items: cart.items,
        finalAmount: cart.finalAmount,
        discountAmount: 0,
        voucher: null,
        availableStock: product.stock
      }
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật giỏ hàng:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Apply voucher
router.post('/apply-voucher', async (req, res) => {
  try {
    const { voucherCode, totalAmount } = req.body;
    const userId = req.user._id;
    const shippingFee = 30000;
    
    if (!voucherCode || !totalAmount) {
      return res.status(400).json({ 
        message: 'Thiếu thông tin voucher hoặc giá trị đơn hàng' 
      });
    }

    const voucher = await Voucher.findOne({ 
      code: voucherCode.toUpperCase(),
      isActive: true,
      endDate: { $gte: new Date() }
    });
    
    if (!voucher) {
      return res.status(400).json({ message: 'Không tìm thấy voucher hoặc voucher đã hết hạn' });
    }

    // Kiểm tra số lần sử dụng
    if (voucher.usedCount >= voucher.usageLimit) {
      return res.status(400).json({ message: 'Voucher đã hết lượt sử dụng' });
    }

    // Kiểm tra người dùng đã sử dụng voucher chưa
    if (voucher.usedBy && voucher.usedBy.some(usage => usage.user.toString() === userId.toString())) {
      return res.status(400).json({ message: 'Bạn đã sử dụng voucher này' });
    }

    // Kiểm tra giá trị đơn hàng tối thiểu
    if (totalAmount < voucher.minPurchase) {
      return res.status(400).json({
        message: `Giá trị đơn hàng tối thiểu để sử dụng mã là ${voucher.minPurchase.toLocaleString('vi-VN')}đ`
      });
    }

    let discountAmount = voucher.calculateDiscount(totalAmount);

    // Cập nhật cart với thông tin voucher
    const updatedCart = await Cart.findOneAndUpdate(
      { user: userId },
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
      finalAmount: updatedCart.finalAmount,
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

// Clear cart
router.post('/clear', async (req, res) => {
  try {
    await Cart.findOneAndUpdate(
      { user: req.user._id },
      { 
        $set: { 
          items: [],
          voucher: null,
          discountAmount: 0
        }
      }
    );
    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error clearing cart' });
  }
});

router.post('/remove-voucher', authChainMiddleware, voucherController.removeVoucher);

module.exports = router;
