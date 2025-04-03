const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
// const authMiddleware = require("../middleware/authMiddleware");
// const adminMiddleware = require("../middleware/adminMiddleware");
const { authChainMiddleware, adminChainMiddleware } = require('../middleware/chainMiddleware');
const upload = require("../middleware/uploadMiddleware");
const Order = require("../models/Order");
const User = require("../models/User");
const Product = require("../models/Product");
const inventoryController = require("../controllers/inventoryController");
const supplierController = require("../controllers/supplierController");
const Delivery = require("../models/Delivery");
const voucherController = require("../controllers/voucherController");
const { synchronizeOrderWithDelivery } = require('../utils/statusSynchronizer');

router.use(authChainMiddleware);
router.use(adminChainMiddleware);

// Quản lý sản phẩm
router.get("/products", adminController.getAllProducts);
router.post("/products", upload.single("image"), adminController.createProduct);
router.put(
  "/products/:id",
  upload.single("image"),
  adminController.updateProduct
);
router.delete("/products/:id", adminController.deleteProduct);

// Quản lý đơn hàng
router.get("/orders", adminController.getAllOrders);
router.put("/orders/:id", adminController.updateOrderStatus);

// Quản lý người dùng
router.get("/users", adminController.getAllUsers);
router.put("/users/:id", adminController.updateUserStatus);
router.put("/users/:userId/role", adminController.changeUserRole);
router.patch("/users/:id/toggle-status", adminController.toggleUserStatus);

// Thống kê
router.get("/statistics", adminController.getStatistics);

// Quản lý kho hàng
router.get("/products/low-stock", inventoryController.getLowStockProducts);
router.put("/products/update-stock", inventoryController.updateStock);

// Quản lý đơn đặt hàng
router.get("/purchase-orders", inventoryController.getPurchaseOrders);
router.post("/purchase-orders", inventoryController.createPurchaseOrder);
router.put(
  "/purchase-orders/:id",
  authChainMiddleware,
  adminChainMiddleware,
  inventoryController.updatePurchaseOrder
);
router.get(
  "/purchase-orders/:id/pdf",
  authChainMiddleware,
  adminChainMiddleware,
  inventoryController.generatePurchaseOrderPDF
);
router.get(
  "/purchase-orders/:id/receipt-pdf",
  authChainMiddleware,
  adminChainMiddleware,
  inventoryController.generateReceiptConfirmationPDF
);

// Kiểm tra hàng tồn kho thấp
router.post("/check-low-stock", inventoryController.manualCheckLowStock);

// Quản lý nhà cung cấp
router.get("/suppliers", supplierController.getSuppliers);
router.post("/suppliers", supplierController.createSupplier);
router.put("/suppliers/:id", supplierController.updateSupplier);
router.delete("/suppliers/:id", supplierController.deleteSupplier);

router.get(
  "/statistics/download",
  adminChainMiddleware,
  adminController.downloadStatisticsReport
);
// Quản lý voucher
router.post("/vouchers", adminController.createVoucher);
router.get(
  "/vouchers",
  authChainMiddleware,
  adminChainMiddleware,
  adminController.getAllVouchers
);
router.put("/vouchers/:id", adminController.updateVoucher);
router.delete("/vouchers/:id", adminController.deleteVoucher);

router.put(
  "/purchase-orders/:id/confirm-receipt",
  authChainMiddleware,
  adminChainMiddleware,
  inventoryController.confirmReceiptAndUpdateInventory
);
router.put("/orders/:id", async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: "Không tìm thấy đơn hàng" 
      });
    }
    
    // Lưu trạng thái ban đầu để kiểm tra kết quả
    const originalOrderStatus = order.status;
    console.log(`[DEBUG] Bắt đầu cập nhật: Order ${order._id} từ ${originalOrderStatus} -> ${status}`);

    // Cập nhật trạng thái order (đã bao gồm đồng bộ sang Delivery)
    const orderStateResult = await order.changeState(status);
    
    if (!orderStateResult.success) {
      return res.status(400).json(orderStateResult);
    }

    res.json({
      success: true,
      message: orderStateResult.message,
      order: order
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái đơn hàng:", error);
    res.status(500).json({ 
      success: false, 
      message: `Lỗi server: ${error.message}` 
    });
  }
});
router.put("/deliveries/:id", async (req, res) => {
  try {
    const { status } = req.body;
    const delivery = await Delivery.findById(req.params.id);
    
    if (!delivery) {
      return res.status(404).json({ 
        success: false, 
        message: "Không tìm thấy đơn giao hàng" 
      });
    }
    
    const order = await Order.findById(delivery.order);
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: "Không tìm thấy đơn hàng" 
      });
    }

    // Lưu trạng thái ban đầu để rollback nếu cần
    const originalDeliveryStatus = delivery.status;
    console.log(`[DEBUG] Bắt đầu cập nhật: Delivery ${delivery._id} từ ${originalDeliveryStatus} -> ${status}`);

    // Cập nhật trạng thái delivery
    const deliveryStateResult = await delivery.changeState(status);
    
    if (!deliveryStateResult.success) {
      return res.status(400).json(deliveryStateResult);
    }

    // Cố gắng đồng bộ hóa trạng thái Order
    const orderSyncResult = await synchronizeOrderWithDelivery(order, status);
    
    if (!orderSyncResult.success) {
      // Nếu không thể đồng bộ, rollback trạng thái delivery
      console.log(`[DEBUG] Đồng bộ thất bại, thực hiện rollback về ${originalDeliveryStatus}`);
      try {
        await delivery.changeState(originalDeliveryStatus);
      } catch (rollbackError) {
        console.error(`[ERROR] Lỗi khi rollback:`, rollbackError);
      }
      
      return res.status(400).json({
        success: false,
        message: `Không thể đồng bộ với đơn hàng: ${orderSyncResult.message}`
      });
    }

    // Cả hai đều thành công
    res.json({
      success: true,
      message: deliveryStateResult.message,
      delivery: delivery,
      order: order
    });
  } catch (error) {
    console.error("Error updating delivery status:", error);
    res.status(500).json({ 
      success: false,
      message: error.message || "Lỗi khi cập nhật trạng thái"
    });
  }
});
router.post("/api/vouchers/apply", voucherController.applyVoucher);

module.exports = router;
