const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middleware/authMiddleware');

// Các route không cần xác thực
router.get('/', categoryController.getAllCategories);
router.get('/:categoryId/path', categoryController.getCategoryPath);
router.get('/:categoryId/subcategories', categoryController.getSubcategories);

// Các route cần xác thực (chỉ cho admin)
router.post('/', authMiddleware, categoryController.createCategory);
router.delete('/:categoryId', authMiddleware, categoryController.deleteCategory);

// New route to handle slug or ID
router.get('/find/:slugOrId', categoryController.getCategoryBySlugOrId);

// New route to handle products by category slug
router.get('/:slug/products', categoryController.getProductsByCategorySlug);

// New route to handle products by category and children recursively
router.get('/:id/products-recursive', categoryController.getProductsByCategoryAndChildren);

// New route to handle categories by full slug
router.get('/by-full-slug/*', categoryController.getCategoryByFullSlug);

module.exports = router;