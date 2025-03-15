const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
// const authMiddleware = require('../middleware/authMiddleware');
const { authChainMiddleware, adminChainMiddleware } = require('../middleware/chainMiddleware');

// Các route không cần xác thực
router.get('/', categoryController.getAllCategories);
router.get('/slug/:slug', categoryController.getCategoryBySlug);
router.get('/path/:categoryId', categoryController.getCategoryPath);
router.get('/subcategories/:categoryId', categoryController.getSubcategories);
router.get('/slugOrId/:slugOrId', categoryController.getCategoryBySlugOrId);
router.get('/products/:slug', categoryController.getProductsByCategorySlug);

// Các route cần xác thực và quyền admin
router.post('/', adminChainMiddleware, categoryController.createCategory);
router.delete('/:categoryId', adminChainMiddleware, categoryController.deleteCategory);

// New route to handle categories by full slug
router.get('/by-full-slug/*', categoryController.getCategoryByFullSlug);

// New route to handle products by category slug
router.get('/:slug/products', categoryController.getProductsByCategorySlug);

module.exports = router;