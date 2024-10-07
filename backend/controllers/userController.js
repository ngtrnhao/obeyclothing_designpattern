const User = require('../models/User');
const Order = require('../models/Order');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { shippingInfo } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { shippingInfo },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};