const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

router.get('/', async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Sửa lại route DELETE
router.delete('/:category', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const category = decodeURIComponent(req.params.category);
    console.log('Attempting to delete category:', category);
    const result = await Product.updateMany({ category }, { $unset: { category: 1 } });
    if (result.modifiedCount > 0) {
      res.json({ message: 'Category đã được xóa thành công' });
    } else {
      res.status(404).json({ message: 'Không tìm thấy sản phẩm nào với category này' });
    }
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Lỗi khi xóa category', error: error.message });
  }
});

module.exports = router;