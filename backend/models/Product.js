const mongoose = require('mongoose');
const slugify = require('slugify');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  image: {
    type: String,
    required: true
  },
  detailImages: [{
    type: String
  }],
  sizes :[{type:String}],
  colors:[{type:String}],
  stock: { 
    type: Number, 
    required: true, 
    min: 0,
    default: 0
  },
  lowStockThreshold: { 
    type: Number, 
    default: 10 
  },
  sizeGuideType: {
    type: String,
    enum: ['TSHIRT', 'PANTS', 'SHOES', 'HOODIE','MENSHIRT'],
    required: true
  },
  reviews: [reviewSchema],
  createdAt: { type: Date, default: Date.now },
  averageRating: { type: Number, default: 0 },
  salesCount: { type: Number, default: 0 },
}, { timestamps: true });

productSchema.pre('save', async function(next) {
  if (this.isModified('name')) {
    this.slug = await createUniqueSlug(this.constructor, this.name);
  }
  next();
});

async function createUniqueSlug(model, name, suffix = '') {
  const slug = slugify(name + suffix, { lower: true });
  const count = await model.countDocuments({ slug: slug });
  if (count > 0) {
    return createUniqueSlug(model, name, `-${count + 1}`);
  }
  return slug;
}

// Thêm phương thức để kiểm tra hàng sắp hết
productSchema.methods.isLowStock = function() {
  return this.stock <= this.lowStockThreshold;
};

// Thêm phương thức để cập nhật số lượng tồn kho
productSchema.methods.updateStock = async function(quantity) {
  if (this.stock + quantity < 0) {
    throw new Error('Số lượng trong kho không đủ');
  }
  this.stock += quantity;
  return this.save();
};

module.exports = mongoose.model('Product', productSchema);
