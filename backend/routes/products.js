const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', productController.getAllProducts);
router.get('/search', productController.searchProducts);
router.get('/:id', productController.getProductById);
router.get('/:id/reviews', productController.getProductReviews);

router.use(authMiddleware);

router.post('/', adminMiddleware, upload.single('image'), productController.createProduct);
router.put('/:id', adminMiddleware, upload.single('image'), productController.updateProduct);
router.delete('/:id', adminMiddleware, productController.deleteProduct);
router.post('/:id/reviews', productController.addProductReview);

module.exports = router;