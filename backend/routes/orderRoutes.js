const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/create-paypal-order', orderController.createPaypalOrder);
router.post('/complete-paypal-order', orderController.completePaypalOrder);

module.exports = router;