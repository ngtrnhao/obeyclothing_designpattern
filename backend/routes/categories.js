const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

router.get('/', categoryController.getAllCategories);

router.use(authMiddleware);
router.use(adminMiddleware);

router.post('/', categoryController.createCategory);
router.delete('/:categoryId', categoryController.deleteCategory);
router.get('/:id/path', categoryController.getCategoryPath);
router.get('/:categoryId/path', categoryController.getCategoryPath);

module.exports = router;