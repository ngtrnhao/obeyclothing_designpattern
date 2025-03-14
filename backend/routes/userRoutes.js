const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
// const authMiddleware = require('../middleware/authMiddleware');
const { authChainMiddleware } = require('../middleware/chainMiddleware');
router.use(authChainMiddleware);

router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.get('/orders', userController.getUserOrders);
router.get('/shipping-addresses', userController.getShippingAddresses);
router.post('/shipping-addresses', userController.addShippingAddress);
router.post('/shipping-addresses', authChainMiddleware, userController.addShippingAddress);
router.delete('/shipping-addresses/:id', userController.deleteShippingAddress);
router.put('/shipping-addresses/:id/set-default', userController.setDefaultShippingAddress);

module.exports = router;
