const mongoose = require('mongoose');

const voucherSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
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
    default: 0,
    min: 0
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  usageLimit: {
    type: Number,
    default: 1,
    min: 1
  },
  usedCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

voucherSchema.methods.isValid = function() {
  const now = new Date();
  return this.isActive && now >= this.startDate && now <= this.endDate && this.usedCount < this.usageLimit;
};

module.exports = mongoose.model('Voucher', voucherSchema);