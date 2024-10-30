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
    streetAddress: String,
    provinceCode: String,
    provinceName: String,
    districtCode: String,
    districtName: String,
    wardCode: String,
    wardName: String,
    isDefault: {
      type: Boolean,
      default: false
    }
  }]
}, { timestamps: true });

module.exports = mongoose.model('ShippingInfo', shippingInfoSchema);
