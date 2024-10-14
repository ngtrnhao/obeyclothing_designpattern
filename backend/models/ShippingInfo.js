const mongoose = require('mongoose');

const shippingInfoSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fullName: String,
  phone: String,
  address: String,
  provinceId: String,
  districtId: String,
  wardId: String,
  provinceName: String,
  districtName: String,
  wardName: String
});

module.exports = mongoose.model('ShippingInfo', shippingInfoSchema);
