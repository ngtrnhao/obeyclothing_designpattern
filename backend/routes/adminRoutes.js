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

    // Ánh xạ trạng thái giao hàng sang trạng thái đơn hàng
    let orderStatus = status;
    if (status === "shipping") {
      orderStatus = "shipped";
    }

    // Sử dụng state pattern
    const stateResult = await order.changeState(orderStatus);
    
    if (!stateResult.success) {
      return res.status(400).json(stateResult);
    }

    // Cập nhật trạng thái giao hàng
    delivery.status = status;
    await delivery.save();

    res.json({
      success: true,
      message: stateResult.message,
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
