const Voucher = require('../models/Voucher');
const Cart = require('../models/Cart');

exports.createVoucher = async (req, res) => {
  try {
    const newVoucher = new Voucher(req.body);
    await newVoucher.save();
    res.status(201).json(newVoucher);
  } catch (error) {
    res.status(400).json({ message: 'Lỗi khi tạo voucher', error: error.message });
  }
};

exports.getVouchers = async (req, res) => {
  try {
    const vouchers = await Voucher.find({ isActive: true, endDate: { $gte: new Date() } });
    res.json(vouchers);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách voucher', error: error.message });
  }
};

exports.applyVoucher = async (req, res) => {
  try {
    const { voucherCode } = req.body;
    const userId = req.user._id;

    // Tìm giỏ hàng của user
    const cart = await Cart.findOne({ user: userId })
      .populate('items.product');
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        message: 'Giỏ hàng trống'
      });
    }

    const voucher = await Voucher.findOne({
      code: voucherCode.toUpperCase()
    });

    if (!voucher) {
      return res.status(400).json({
        message: 'Không tìm thấy voucher'
      });
    }

    // Kiểm tra tính hợp lệ của voucher
    if (!voucher.isValid()) {
      return res.status(400).json({
        message: 'Voucher đã hết hạn hoặc hết lượt sử dụng'
      });
    }

    // Kiểm tra user đã sử dụng voucher chưa
    if (voucher.hasUserUsed(userId)) {
      return res.status(400).json({
        message: 'Bạn đã sử dụng voucher này'
      });
    }

    // Kiểm tra điều kiện áp dụng
    const canApply = voucher.canApplyToCart(cart);
    if (!canApply.valid) {
      return res.status(400).json({
        message: canApply.message
      });
    }

    // Tính toán giảm giá
    const totalAmount = cart.items.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0
    );
    const discountAmount = voucher.calculateDiscount(totalAmount);

    // Cập nhật giỏ hàng
    cart.voucher = voucher._id;
    cart.discountAmount = discountAmount;
    cart.finalAmount = totalAmount + 30000 - discountAmount;
    await cart.save();

    res.json({
      discountAmount,
      finalAmount: cart.finalAmount,
      message: 'Áp dụng voucher thành công'
    });

  } catch (error) {
    console.error('Lỗi khi áp dụng voucher:', error);
    res.status(500).json({
      message: 'Lỗi server'
    });
  }
};
