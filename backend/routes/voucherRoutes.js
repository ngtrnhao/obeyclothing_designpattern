const express = require("express");
const router = express.Router();
const voucherController = require("../controllers/voucherController");
// const authMiddleware = require("../middleware/authMiddleware");
// const adminMiddleware = require("../middleware/adminMiddleware");
const {
  authChainMiddleware,
  adminChainMiddleware,
} = require("../middleware/chainMiddleware");

router.get("/", authChainMiddleware, voucherController.getVouchers);
router.post("/apply", authChainMiddleware, voucherController.applyVoucher);
router.post(
  "/",
  authChainMiddleware,
  adminChainMiddleware,
  voucherController.createVoucher
);

module.exports = router;
