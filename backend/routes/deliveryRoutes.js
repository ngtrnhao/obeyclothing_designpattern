const express = require("express");
const router = express.Router();
const Delivery = require("../models/Delivery");
const Order = require("../models/Order");
// const authMiddleware = require("../middleware/authMiddleware");
// const adminMiddleware = require("../middleware/authMiddleware");
const { authChainMiddleware, adminChainMiddleware } = require('../middleware/chainMiddleware');
const { createDeliveryNotePDF } = require("../utils/pdfGenerator");

router.use(authChainMiddleware);
router.use(adminChainMiddleware);

router.get("/", async (req, res) => {
  try {
    const deliveries = await Delivery.find()
      .populate({
        path: "order",
        select: "paypalOrderId totalAmount status user",
        populate: {
          path: "user",
          select: "username email",
        },
      })
      .populate("shippingInfo");
    res.json(deliveries);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

// router.put("/:id", async (req, res) => {
//  ...
// });

router.get("/:id/delivery-note", async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id)
      .populate({
        path: "order",
        populate: {
          path: "items.product",
          select: "name price",
        },
      })
      .populate("shippingInfo");

    if (!delivery) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy thông tin giao hàng" });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=delivery-note-${delivery._id}.pdf`
    );

    createDeliveryNotePDF(delivery, res);
  } catch (error) {
    console.error("Lỗi khi tạo phiếu giao hàng:", error);
    res
      .status(500)
      .json({ message: "Lỗi khi tạo phiếu giao hàng", error: error.message });
  }
});

module.exports = router;
