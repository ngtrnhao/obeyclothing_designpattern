const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

router.get('/', categoryController.getAllCategories);

router.use(authMiddleware);
router.use(adminMiddleware);

router.delete('/:category', categoryController.deleteCategory);

module.exports = router;