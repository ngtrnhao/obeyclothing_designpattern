const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminMiddleware = require('../middleware/adminMiddleware');

router.patch('/users/:id/toggle-status', adminMiddleware, adminController.toggleUserStatus);

module.exports = router; 