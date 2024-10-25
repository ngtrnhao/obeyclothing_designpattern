const mongoose = require('mongoose');

const shippingInfoSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  addresses: [{
    fullName: String,
    phone: String,
    address: String,
    provinceId: String,
    provinceName: String,
    districtId: String,
    districtName: String,
    wardId: String,
    wardName: String,
    isDefault: {
      type: Boolean,
      default: false
    }
  }]
}, { timestamps: true });

module.exports = mongoose.model('ShippingInfo', shippingInfoSchema);
