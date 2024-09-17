const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { items, totalAmount } = req.body;
    const newOrder = new Order({
      user: req.user._id,
      items,
      totalAmount,
      status: 'pending'
    });
    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Lỗi khi tạo đơn hàng' });
  }
});

module.exports = router;