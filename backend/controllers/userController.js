const User = require('../models/User');
const Order = require('../models/Order');
const ShippingInfo = require('../models/ShippingInfo');

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
    const userId = req.user._id;
    const updates = req.body;

    // Cập nhật thông tin người dùng
    const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true });

    // Cập nhật hoặc tạo mới thông tin giao hàng
    let shippingInfo = await ShippingInfo.findOne({ user: userId });
    if (shippingInfo) {
      Object.assign(shippingInfo, updates);
    } else {
      shippingInfo = new ShippingInfo({
        ...updates,
        user: userId // Đảm bảo trường user được gán giá trị
      });
    }
    await shippingInfo.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      shippingInfo: shippingInfo
    });
  } catch (error) {
    console.error('Error in updateProfile:', error);
    res.status(400).json({ message: 'Không thể cập nhật thông tin người dùng', error: error.message });
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
