const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const multer = require('multer');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});
const upload = multer({ storage: storage });

router.get('/', productController.getAllProducts);
router.get('/search', productController.searchProducts);
router.get('/:id', productController.getProductById);
router.get('/:id/reviews', productController.getProductReviews);

router.use(authMiddleware);

router.post('/', authMiddleware, adminMiddleware, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'detailImages', maxCount: 5 }
]), productController.createProduct);
router.put('/:id', authMiddleware, adminMiddleware, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'detailImages', maxCount: 5 }
]), productController.updateProduct);
router.delete('/:id', adminMiddleware, productController.deleteProduct);
router.post('/:id/reviews', productController.addProductReview);

router.get('/category/:categoryId', productController.getProductsByCategory);

module.exports = router;