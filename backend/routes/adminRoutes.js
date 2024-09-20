const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(authMiddleware);
router.use(adminMiddleware);

// Quản lý sản phẩm
router.get('/products', adminController.getAllProducts);
router.post('/products', upload.single('image'), adminController.createProduct);
router.put('/products/:id', upload.single('image'), adminController.updateProduct);
router.delete('/products/:id', adminController.deleteProduct);

// Quản lý đơn hàng
router.get('/orders', adminController.getAllOrders);
router.put('/orders/:id', adminController.updateOrderStatus);

// Quản lý người dùng
router.get('/users', adminController.getAllUsers);
router.put('/users/:id', adminController.updateUserStatus);

// Thống kê
router.get('/statistics', adminController.getStatistics);

module.exports = router;