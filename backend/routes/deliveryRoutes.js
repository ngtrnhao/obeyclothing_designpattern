const express = require('express');
const router = express.Router();
const Delivery = require('../models/Delivery');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/', async (req, res) => {
  try {
    const deliveries = await Delivery.find().populate({
      path: 'order',
      select: 'paypalOrderId totalAmount status user',
      populate: {
        path: 'user',
        select: 'username email'
      }
    });
    res.json(deliveries);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const delivery = await Delivery.findByIdAndUpdate(id, { status }, { new: true });
    if (!delivery) {
      return res.status(404).json({ message: 'Không tìm thấy đơn giao hàng' });
    }
    res.json(delivery);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

module.exports = router;  