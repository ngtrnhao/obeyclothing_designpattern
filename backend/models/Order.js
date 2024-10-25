const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
 user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  paypalOrderId: { type: String },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'paid'],
    default: 'pending'
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    },
    size: String,
    color: String
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  shippingInfo: { // Store shipping info directly
    fullName: String,
    phone: String,
    address: String,
    provinceCode: String,
    districtCode: String,
    wardCode: String,
    provinceName: String,
    districtName: String,
    wardName: String
  },
  voucher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Voucher'
  },
  discountAmount: {
    type: Number,
    default: 0
  },
  invoice: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
  delivery: { type: mongoose.Schema.Types.ObjectId, ref: 'Delivery' }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
