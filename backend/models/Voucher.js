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
  usageCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  applicableCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  applicableUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

voucherSchema.methods.isValid = function() {
  const now = new Date();
  console.log('Kiểm tra voucher:', {
    code: this.code,
    startDate: this.startDate,
    endDate: this.endDate,
    now: now,
    usageLimit: this.usageLimit,
    usageCount: this.usageCount,
    isActive: this.isActive
  });

  return (
    this.isActive &&
    this.startDate <= now &&
    this.endDate >= now &&
    this.usageCount < this.usageLimit
  );
};

module.exports = mongoose.model('Voucher', voucherSchema);
