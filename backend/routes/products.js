const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Cấu hình storage cho Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'obey-clothing',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
  }
});

const upload = multer({ storage: storage });

// Các route không cần xác thực
router.get('/related',productController.getRelatedProducts);
router.get('/search/suggestions', productController.getSearchSuggestions);
router.get('/search', productController.searchProducts);
router.get('/category/:categoryId/all', productController.getProductsByParentCategory);
router.get('/category/:categoryId', productController.getProductsByCategory);
router.get('/slug/:slug', productController.getProductBySlug);
router.get('/:id/reviews', productController.getProductReviews);
router.get('/:id', productController.getProductById);
router.get('/', productController.getAllProducts);

// Các route cần xác thực
router.use(authMiddleware);
router.post('/:id/reviews', productController.addProductReview);

// Các route cần xác thực admin
router.use(adminMiddleware);
router.post('/', upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'detailImages', maxCount: 5 }
]), productController.createProduct);

router.put('/:id', upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'detailImages', maxCount: 5 }
]), productController.updateProduct);

router.delete('/:id', productController.deleteProduct);

module.exports = router;