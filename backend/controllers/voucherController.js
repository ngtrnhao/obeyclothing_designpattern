const Voucher = require('../models/Voucher');

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
  console.log('Request body:', req.body);
  try {
    const { voucherCode, totalAmount } = req.body;
    
    if (!voucherCode || !totalAmount) {
      console.error('Thiếu thông tin:', { voucherCode, totalAmount });
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
    const shippingFee =30000;
    let discountAmount = 0;
    if (voucher.discountType === 'percentage') {
      discountAmount = totalAmount * (voucher.discountValue / 100);
      if (voucher.maxDiscount) {
        discountAmount = Math.min(discountAmount, voucher.maxDiscount);
      }
    } else {
      discountAmount = voucher.discountValue;
    }

    const finalAmount = totalAmount + shippingFee - discountAmount ;

    console.log('Calculated amounts:', {
      totalAmount,
      discountAmount,
      finalAmount
    });

    res.json({
      discountAmount,
      finalAmount,
      totalAfterDiscount: finalAmount,
      voucher: voucher._id,
      message: 'Áp dụng voucher thành công'
    });
  } catch (error) {
    console.error('Lỗi server:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};
