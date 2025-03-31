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
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  image: { type: String, required: true },
  detailImages: [{ type: String }],
  sizes: [{ type: String }],
  colors: [{ type: String }],
  stock: { type: Number, required: true, min: 0, default: 0 },
  lowStockThreshold: { type: Number, default: 10 },
  sizeGuideType: { type: String, enum: ['TSHIRT', 'PANTS', 'SHOES', 'HOODIE', 'MENSHIRT'], required: true },
  reviews: [reviewSchema],
  createdAt: { type: Date, default: Date.now },
  averageRating: { type: Number, default: 0 },
  salesCount: { type: Number, default: 0 }
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

// Kiểm tra nếu model đã tồn tại trước khi đăng ký lại
const ProductModel = mongoose.models.Product || mongoose.model('Product', productSchema);

// Product Builder Class
class ProductBuilder {
  constructor() {
    this.product = new ProductModel();
  }
  setName(name) {
    this.product.name = name;
    return this;
  }
  setDescription(description) {
    this.product.description = description;
    return this;
  }
  setPrice(price) {
    this.product.price = price;
    return this;
  }
  setCategory(category) {
    this.product.category = category;
    return this;
  }
  setImage(image) {
    this.product.image = image;
    return this;
  }
  setDetailImages(images) {
    this.product.detailImages = images;
    return this;
  }
  setSizes(sizes) {
    this.product.sizes = sizes;
    return this;
  }
  setColors(colors) {
    this.product.colors = colors;
    return this;
  }
  setStock(stock) {
    this.product.stock = stock;
    return this;
  }
  setSizeGuideType(type) {
    this.product.sizeGuideType = type;
    return this;
  }
  build() {
    return this.product;
  }
}

module.exports = { ProductModel, ProductBuilder };
