const mongoose = require('mongoose');

const purchaseOrderSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  suggestedQuantity: {
    type: Number,
    required: true
  },
  actualQuantity: {
    type: Number
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'completed'],
    default: 'pending'
  },
  orderDate: {
    type: Date
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  },
  notes: String
}, { timestamps: true });

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema);