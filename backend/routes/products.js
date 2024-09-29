const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const multer = require('multer');
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 } // Giới hạn kích thước file ( 5MB)
});

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

module.exports = router;