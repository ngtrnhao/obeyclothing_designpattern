const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);

// Protected routes
router.use(authMiddleware);

// Admin routes
router.use('/admin', adminMiddleware);

// Route test
router.get('/test', (req, res) => {
  res.json({ message: 'Auth route is working' });
});

module.exports = router;