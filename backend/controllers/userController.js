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
    const { profileUpdates, shippingInfoUpdates } = req.body;

    const updatedUser = await User.findByIdAndUpdate(userId, profileUpdates, { new: true });

    let shippingInfo = await ShippingInfo.findOne({ user: userId });
    if (!shippingInfo) {
      shippingInfo = new ShippingInfo({ user: userId, addresses: [] });
    }

    if (shippingInfoUpdates) {
      if (shippingInfoUpdates.isNew) {
        shippingInfo.addresses.push(shippingInfoUpdates);
      } else {
        const index = shippingInfo.addresses.findIndex(addr => addr._id.toString() === shippingInfoUpdates._id);
        if (index !== -1) {
          shippingInfo.addresses[index] = { ...shippingInfo.addresses[index], ...shippingInfoUpdates };
        }
      }
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

exports.getShippingAddresses = async (req, res) => {
  try {
    const shippingInfo = await ShippingInfo.findOne({ user: req.user._id });
    res.json(shippingInfo ? shippingInfo.addresses : []);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy địa chỉ giao hàng', error: error.message });
  }
};

exports.addShippingAddress = async (req, res) => {
  try {
    const {
      fullName,
      phone,
      streetAddress,
      provinceCode,
      provinceName,
      districtCode,
      districtName,
      wardCode,
      wardName
    } = req.body;

    if (!fullName || !phone || !streetAddress || !provinceCode || !districtCode || !wardCode) {
      return res.status(400).json({ message: 'Thiếu thông tin địa chỉ bắt buộc' });
    }

    let shippingInfo = await ShippingInfo.findOne({ user: req.user._id });
    
    if (!shippingInfo) {
      shippingInfo = new ShippingInfo({
        user: req.user._id,
        addresses: []
      });
    }

    const newAddress = {
      fullName,
      phone,
      streetAddress,
      provinceCode,
      provinceName,
      districtCode,
      districtName,
      wardCode,
      wardName,
      isDefault: shippingInfo.addresses.length === 0
    };

    shippingInfo.addresses.push(newAddress);
    await shippingInfo.save();

    res.status(201).json(newAddress);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi thêm địa chỉ', error: error.message });
  }
};

exports.updateShippingAddress = async (req, res) => {
  try {
    const shippingInfo = await ShippingInfo.findOne({ user: req.user._id });
    if (!shippingInfo) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin giao hàng' });
    }
    const addressIndex = shippingInfo.addresses.findIndex(addr => addr._id.toString() === req.params.id);
    if (addressIndex === -1) {
      return res.status(404).json({ message: 'Không tìm thấy địa chỉ giao hàng' });
    }
    shippingInfo.addresses[addressIndex] = { ...shippingInfo.addresses[addressIndex], ...req.body };
    await shippingInfo.save();
    res.json(shippingInfo.addresses);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi cập nhật địa chỉ giao hàng', error: error.message });
  }
};

exports.deleteShippingAddress = async (req, res) => {
  try {
    const shippingInfo = await ShippingInfo.findOne({ user: req.user._id });
    if (!shippingInfo) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin giao hàng' });
    }
    shippingInfo.addresses = shippingInfo.addresses.filter(addr => addr._id.toString() !== req.params.id);
    await shippingInfo.save();
    res.json(shippingInfo.addresses);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa địa chỉ giao hàng', error: error.message });
  }
};

exports.setDefaultShippingAddress = async (req, res) => {
  try {
    const shippingInfo = await ShippingInfo.findOne({ user: req.user._id });
    if (!shippingInfo) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin giao hàng' });
    }
    shippingInfo.addresses.forEach(addr => {
      addr.isDefault = addr._id.toString() === req.params.id;
    });
    await shippingInfo.save();
    res.json(shippingInfo.addresses);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi đặt địa chỉ mặc định', error: error.message });
  }
};
