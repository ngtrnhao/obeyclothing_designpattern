const express = require('express');
const router = express.Router();
const Delivery = require('../models/Delivery');
const Order = require('../models/Order');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/', async (req, res) => {
  try {
    const deliveries = await Delivery.find()
      .populate({
        path: 'order',
        select: 'paypalOrderId totalAmount status user',
        populate: {
          path: 'user',
          select: 'username email'
        }
      })
      .populate('shippingInfo');
    res.json(deliveries);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const updatedDelivery = await Delivery.findByIdAndUpdate(id, { status }, { new: true })
      .populate('shippingInfo');
    
    if (!updatedDelivery) {
      return res.status(404).json({ message: 'Không tìm thấy đơn giao hàng' });
    }

    let orderStatus;
    switch (status) {
      case 'pending':
        orderStatus = 'processing';
        break;
      case 'shipping':
        orderStatus = 'shipped';
        break;
      case 'delivered':
        orderStatus = 'delivered';
        break;
      case 'cancelled':
        orderStatus = 'cancelled';
        break;
      default:
        orderStatus = 'processing';
    }

    const updatedOrder = await Order.findByIdAndUpdate(updatedDelivery.order, { status: orderStatus }, { new: true });

    res.json({ delivery: updatedDelivery, order: updatedOrder });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

module.exports = router;
