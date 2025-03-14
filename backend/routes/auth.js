const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
// const authMiddleware = require("../middleware/authMiddleware");
// const adminMiddleware = require("../middleware/adminMiddleware");
const { authChainMiddleware, adminChainMiddleware } = require('../middleware/chainMiddleware');

// Public routes
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password/:token", authController.resetPassword);

// Protected routes
router.use(authChainMiddleware);

// Admin routes
router.use("/admin", adminChainMiddleware);

// Route test
router.get("/test", (req, res) => {
  res.json({ message: "Auth route is working" });
});

module.exports = router;
