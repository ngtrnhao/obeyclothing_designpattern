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
  finalAmount: {  
    type: Number,
    required: true
  },
  shippingInfo: {
    fullName: String,
    phone: String,
    streetAddress: String,
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
  delivery: { type: mongoose.Schema.Types.ObjectId, ref: 'Delivery' },
  paymentMethod: {
    type: String,
    enum: ['cod', 'paypal', 'banking'],
    required: true
  },
  codStatus: {
    type: String,
    enum: ['pending', 'collected', 'failed'],
    default: 'pending'
  },
  codAmount: {
    type: Number,
    required: function() {
      return this.paymentMethod === 'cod';
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
