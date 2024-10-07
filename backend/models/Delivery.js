const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  shippingAddress: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Delivery', deliverySchema);