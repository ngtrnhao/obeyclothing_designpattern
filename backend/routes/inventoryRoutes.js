const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');

router.get('/purchase-orders', inventoryController.getPurchaseOrders);
router.put('/purchase-orders/:id', inventoryController.updatePurchaseOrder);
router.get('/purchase-orders/:id/pdf', inventoryController.generatePurchaseOrderPDF);
router.get('/low-stock', inventoryController.getLowStockProducts);
router.put('/update-stock', inventoryController.updateStock);

module.exports = router;