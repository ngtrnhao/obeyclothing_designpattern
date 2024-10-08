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
    console.log('Received update data:', req.body);
    const user = await User.findById(req.user._id);
    if (user) {
      // Cập nhật các trường thông tin
      const fieldsToUpdate = [
        'fullName', 'email', 'phone', 'address', 
        'provinceId', 'districtId', 'wardId', 
        'provinceName', 'districtName', 'wardName'
      ];
      
      fieldsToUpdate.forEach(field => {
        if (req.body[field] !== undefined) {
          // Đảm bảo address là string
          if (field === 'address' && typeof req.body[field] === 'object') {
            user[field] = JSON.stringify(req.body[field]);
          } else {
            user[field] = req.body[field];
          }
        }
      });

      console.log('Updated user object before save:', user);
      const updatedUser = await user.save();
      console.log('Updated user object after save:', updatedUser);
      
      // Trả về thông tin người dùng đã cập nhật
      const userResponse = fieldsToUpdate.reduce((acc, field) => {
        acc[field] = updatedUser[field];
        return acc;
      }, { _id: updatedUser._id });

      res.json(userResponse);
    } else {
      res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
  } catch (error) {
    console.error('Error in updateProfile:', error);
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