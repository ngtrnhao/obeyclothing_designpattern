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
  try {
    const { code, totalAmount } = req.body;
    const voucher = await Voucher.findOne({ code, isActive: true });

    if (!voucher || !voucher.isValid()) {
      return res.status(400).json({ message: 'Voucher không hợp lệ hoặc đã hết hạn' });
    }

    if (totalAmount < voucher.minPurchase) {
      return res.status(400).json({ message: `Đơn hàng phải có giá trị tối thiểu ${voucher.minPurchase}đ để áp dụng voucher này` });
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

    res.json({ discountAmount, voucher: voucher._id });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi áp dụng voucher', error: error.message });
  }
};