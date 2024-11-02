const mongoose = require('mongoose');

const voucherSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true
  },
  discountValue: {
    type: Number,
    required: true,
    min: 0
  },
  maxDiscount: {
    type: Number,
    min: 0
  },
  minPurchase: {
    type: Number,
    required: true,
    min: 0
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  usageLimit: {
    type: Number,
    required: true,
    min: 1
  },
  usedCount: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  usedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    usedAt: Date
  }]
}, { timestamps: true });

// Phương thức kiểm tra voucher có còn hiệu lực
voucherSchema.methods.isValid = function() {
  const now = new Date();
  return (
    this.isActive &&
    now >= this.startDate &&
    now <= this.endDate &&
    this.usedCount < this.usageLimit
  );
};

// Phương thức kiểm tra user đã sử dụng voucher chưa
voucherSchema.methods.hasUserUsed = function(userId) {
  return this.usedBy.some(usage => usage.user.toString() === userId.toString());
};

// Phương thức tính toán số tiền giảm giá
voucherSchema.methods.calculateDiscount = function(totalAmount) {
  if (!this.isValid()) return 0;

  let discount = 0;
  if (this.discountType === 'percentage') {
    discount = (totalAmount * this.discountValue) / 100;
    if (this.maxDiscount) {
      discount = Math.min(discount, this.maxDiscount);
    }
  } else {
    discount = this.discountValue;
  }

  return Math.min(discount, totalAmount);
};

const Voucher = mongoose.model('Voucher', voucherSchema);
module.exports = Voucher;
