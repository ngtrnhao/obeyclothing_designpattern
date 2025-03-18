const mongoose = require('mongoose');

const purchaseOrderSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  suggestedQuantity: {
    type: Number,
    required: true,
    min: [1, 'Số lượng đặt hàng phải lớn hơn 0']
  },
  actualQuantity: {
    type: Number,
    min: [1, 'Số lượng thực nhận phải lớn hơn 0']
  },
  receiptDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'received', 'cancelled'],
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
