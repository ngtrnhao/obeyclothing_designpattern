const express = require('express');
const router = express.Router();
const voucherController = require('../controllers/voucherController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

router.get('/', authMiddleware, voucherController.getVouchers);
router.post('/apply', authMiddleware, voucherController.applyVoucher);
router.post('/', authMiddleware, adminMiddleware, voucherController.createVoucher);

module.exports = router;
