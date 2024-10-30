const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  shippingInfo: { // Define shippingInfo as an embedded object
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
  status: {
    type: String,
    enum: ['pending', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Delivery', deliverySchema);
