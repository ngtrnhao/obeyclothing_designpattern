const Product = require("../models/Product");
const multer = require("multer");
const Category = require("../models/Category"); // Thêm dòng này ở đầu file
const cloudinary = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const CategoryService = require('../services/CategoryService');

cloudinary.config({
  cloude_name: process.env.CLOUDDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: " obey-clothing",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});
const upload = multer({ storage: storage });
exports.getRelatedProducts = async (req, res) => {
  try {
    const { category, limit = 4, exclude } = req.query;
    let query = {};

    if (category) {
      query.category = category;
    }
    //điều kiện loại từ sản phẩm
    if (exclude) {
      query._id = { $ne: exclude };
    }
    const products = await Product.find(query)
      .limit(parseInt(limit))
      .populate("category");

    res.json(products);
  } catch (error) {
    console.error("Error in getting product:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
exports.getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const products = await Product.find()
      .skip(skip)
      .limit(limit)
      .populate('category');

    const total = await Product.countDocuments();
    
    res.json({
      products,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + products.length < total
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }
    console.log("Product data:", product); // Thêm log để kiểm tra
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      categoryId,
      stock,
      sizes,
      colors,
      sizeGuideType,
    } = req.body;
    let image = "";
    let detailImages = [];

    if (req.files) {
      if (req.files["image"]) {
        image = req.files["image"][0].path; // Cloudinary trả về URL đầy đủ
      }
      if (req.files["detailImages"]) {
        detailImages = req.files["detailImages"].map((file) => file.path);
      }
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Danh mục không tồn tại" });
    }

    const newProduct = new Product({
      name,
      description,
      price,
      category: categoryId,
      image, // URL từ Cloudinary
      detailImages, // Array các URL từ Cloudinary
      stock,
      sizes: sizes ? sizes.split(",").map((size) => size.trim()) : [],
      colors: colors ? colors.split(",").map((color) => color.trim()) : [],
      sizeGuideType,
    });

    await newProduct.save();

    // Cập nhật số lượng sản phẩm trong danh mục
    category.productCount = (category.productCount || 0) + 1;
    await category.save();

    console.log("New product created:", newProduct);

    res.status(201).json(newProduct);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Lỗi khi tạo sản phẩm", error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }
    res.json(product);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Lỗi khi cập nhật sản phẩm", error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }
    res.json({ message: "Đã xóa sản phẩm" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi xóa sản phẩm", error: error.message });
  }
};

exports.getProductReviews = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "reviews.user",
      "name"
    );
    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }
    res.json(product.reviews);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

exports.addProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    const review = {
      user: req.user._id,
      rating: Number(rating),
      comment,
    };

    product.reviews.push(review);
    await product.save();

    res.status(201).json({ message: "Đã thêm đánh giá thành công" });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Lỗi khi thêm đánh giá", error: error.message });
  }
};

exports.searchProducts = async (req, res) => {
  try {
    const { keyword, category, minPrice, maxPrice, minRating, sort } =
      req.query;
    let query = {};

    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ];
    }

    if (category) {
      const categoryObj = await Category.findById(category);
      if (categoryObj) {
        const childCategories = await Category.find({ parent: category });
        const categoryIds = [category, ...childCategories.map((c) => c._id)];
        query.category = { $in: categoryIds };
      }
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (minRating) {
      query.averageRating = { $gte: Number(minRating) };
    }

    let sortOption = {};
    if (sort === "price_asc") sortOption.price = 1;
    if (sort === "price_desc") sortOption.price = -1;
    if (sort === "newest") sortOption.createdAt = -1;
    if (sort === "best_selling") sortOption.salesCount = -1;

    const products = await Product.find(query).sort(sortOption).limit(20);

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

exports.getProductsByCategory = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    console.log("Fetching products for category:", categoryId);

    const products = await CategoryService.getProductsByCategory(categoryId, true);
    console.log("Products found:", products.length);

    res.json(products);
  } catch (error) {
    console.error("Error in getProductsByCategory:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

exports.getProductsByCategorySlug = async (req, res) => {
  try {
    const slug = req.params.slug;
    const products = await CategoryService.getProductsByCategory(slug, true);
    res.json(products);
  } catch (error) {
    console.error("Error in getProductsByCategorySlug:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

exports.getProductsByParentCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    // Chỉ lấy sản phẩm trong danh mục này và danh mục con cấp 1
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Lấy danh sách ID danh mục con cấp 1
    const subcategories = await CategoryService.getSubcategories(categoryId);
    const categoryIds = [categoryId, ...subcategories.map(sub => sub._id)];

    const products = await Product.find({ category: { $in: categoryIds } });
    res.json(products);
  } catch (error) {
    console.error("Error in getProductsByParentCategory:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    console.log("Requested slug:", slug);
    if (!slug || slug === "undefined") {
      return res.status(400).json({ message: "Invalid slug" });
    }
    const product = await Product.findOne({ slug });
    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }
    res.json(product);
  } catch (error) {
    console.error("Error in getProductBySlug:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

exports.getSearchSuggestions = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json([]);

    const suggestions = await Product.find({
      $or: [
        { name: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ],
    })
      .select("name image price slug")
      .limit(5)
      .lean();

    res.json(suggestions);
  } catch (error) {
    console.error("Error in search suggestions:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
