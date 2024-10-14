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
    console.log('Received update data:', req.body);
    const user = await User.findById(req.user._id);
    if (user) {
      // Cập nhật các trường thông tin cơ bản
      const fieldsToUpdate = ['fullName', 'email', 'phone'];
      fieldsToUpdate.forEach(field => {
        if (req.body[field] !== undefined) {
          user[field] = req.body[field];
        }
      });

      // Cập nhật hoặc tạo mới ShippingInfo
      if (user.shippingInfo) {
        await ShippingInfo.findByIdAndUpdate(user.shippingInfo, {
          fullName: req.body.fullName,
          phone: req.body.phone,
          address: req.body.address,
          provinceId: req.body.provinceId,
          provinceName: req.body.provinceName,
          districtId: req.body.districtId,
          districtName: req.body.districtName,
          wardId: req.body.wardId,
          wardName: req.body.wardName
        });
      } else {
        const newShippingInfo = new ShippingInfo({
          fullName: req.body.fullName,
          phone: req.body.phone,
          address: req.body.address,
          provinceId: req.body.provinceId,
          provinceName: req.body.provinceName,
          districtId: req.body.districtId,
          districtName: req.body.districtName,
          wardId: req.body.wardId,
          wardName: req.body.wardName
        });
        const savedShippingInfo = await newShippingInfo.save();
        user.shippingInfo = savedShippingInfo._id;
      }

      console.log('Updated user object before save:', user);
      const updatedUser = await user.save();
      console.log('Updated user object after save:', updatedUser);
      
      // Trả về thông tin người dùng đã cập nhật
      const userResponse = await User.findById(updatedUser._id).populate('shippingInfo');
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
