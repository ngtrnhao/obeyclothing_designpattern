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

    const voucher = await Voucher.findOne({
      code: voucherCode.toUpperCase(),
      isActive: true,
      endDate: { $gte: new Date() },
      startDate: { $lte: new Date() }
    });

    if (!voucher) {
      return res.status(400).json({
        message: 'Mã giảm giá không tồn tại hoặc đã hết hạn'
      });
    }

    // Kiểm tra số lần sử dụng
    if (voucher.usedCount >= voucher.usageLimit) {
      voucher.isActive = false;
      await voucher.save();
      return res.status(400).json({
        message: 'Voucher đã hết lượt sử dụng'
      });
    }

    // Kiểm tra người dùng đã sử dụng
    const hasUsed = voucher.usedBy.some(usage => 
      usage.user.toString() === userId.toString()
    );

    if (hasUsed) {
      return res.status(400).json({
        message: 'Bạn đã sử dụng voucher này'
      });
    }

    // Tăng số lần sử dụng và thêm người dùng vào danh sách đã sử dụng
    voucher.usedCount += 1;
    voucher.usedBy.push({
      user: userId,
      usedAt: new Date()
    });

    // Nếu đạt giới hạn thì vô hiệu hóa voucher
    if (voucher.usedCount >= voucher.usageLimit) {
      voucher.isActive = false;
    }

    await voucher.save();

    // Tìm giỏ hàng của user
    const cart = await Cart.findOne({ user: userId })
      .populate('items.product');
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        message: 'Giỏ hàng trống'
      });
    }

    // Tính tổng giá trị đơn hàng
    const totalAmount = cart.items.reduce((sum, item) => 
      sum + (item.product.price * item.quantity), 0
    );

    if (totalAmount < voucher.minPurchase) {
      return res.status(400).json({
        message: `Giá trị đơn hàng tối thiểu để sử dụng mã là ${voucher.minPurchase.toLocaleString('vi-VN')}đ`
      });
    }

    // Tính toán giảm giá
    const discountAmount = voucher.calculateDiscount(totalAmount);

    // Chỉ cập nhật cart
    const updatedCart = await Cart.findOneAndUpdate(
      { user: userId },
      {
        voucher: voucher._id,
        discountAmount: discountAmount,
        finalAmount: totalAmount + 30000 - discountAmount
      },
      { new: true }
    );

    res.json({
      success: true,
      discountAmount,
      finalAmount: updatedCart.finalAmount,
      remainingUses: voucher.usageLimit - voucher.usedCount,
      message: 'Áp dụng mã giảm giá thành công'
    });

  } catch (error) {
    console.error('Lỗi khi áp dụng voucher:', error);
    res.status(500).json({
      message: 'Đã có lỗi xảy ra'
    });
  }
};

exports.removeVoucher = async (req, res) => {
  try {
    const userId = req.user._id;
    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({
        message: 'Không tìm thấy giỏ hàng'
      });
    }

    // Reset voucher information
    cart.voucher = null;
    cart.discountAmount = 0;
    cart.finalAmount = cart.items.reduce((sum, item) => 
      sum + (item.product.price * item.quantity), 0
    ) + 30000; // Cộng phí ship

    await cart.save();

    res.json({
      success: true,
      message: 'Đã xóa mã giảm giá',
      finalAmount: cart.finalAmount
    });

  } catch (error) {
    console.error('Lỗi khi xóa voucher:', error);
    res.status(500).json({
      message: 'Đã có lỗi xảy ra'
    });
  }
};
