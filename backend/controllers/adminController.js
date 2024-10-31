const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const Voucher = require('../models/Voucher');
const moment = require('moment');

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách sản phẩm', error: error.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, price, description, category } = req.body;
    const image = req.file ? req.file.filename : '';
    const newProduct = new Product({ name, price, description, category, image });
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi tạo sản phẩm mới' });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, description, category } = req.body;
    const image = req.file ? req.file.filename : undefined;

    const updateData = { name, price, description, category };
    if (image) {
      updateData.image = image;
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }

    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Lỗi khi cập nhật sản phẩm' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Sản phẩm đã được xóa' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa sản phẩm' });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'username email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách đơn hàng' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái đơn hàng' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('username email role isActive');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách người dùng' });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    const updatedUser = await User.findByIdAndUpdate(id, { isActive }, { new: true }).select('-password');
    if (!updatedUser) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái người dùng' });
  }
};

exports.getStatistics = async (req, res) => {
  try {
    const { startDate, endDate, period } = req.query;
    const start = startDate ? moment(startDate).startOf('day') : moment().subtract(30, 'days').startOf('day');
    const end = endDate ? moment(endDate).endOf('day') : moment().endOf('day');

    const totalRevenue = await calculateTotalRevenue(start, end);
    const totalOrders = await countDeliveredOrders(start, end);
    const totalUsers = await User.countDocuments();
    const topProducts = await getTopProducts(start, end);
    const salesData = await getSalesData(start, end, period);

    res.json({
      totalRevenue,
      totalOrders,
      totalUsers,
      topProducts,
      salesData
    });
  } catch (error) {
    console.error('Error in getStatistics:', error);
    res.status(500).json({ message: 'Error fetching statistics', error: error.message });
  }
};

async function calculateTotalRevenue(start, end) {
  const result = await Order.aggregate([
    {
      $match: {
        status: 'delivered',
        updatedAt: { $gte: start.toDate(), $lte: end.toDate() }
      }
    },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } }
  ]);
  return result[0]?.total || 0;
}

async function countDeliveredOrders(start, end) {
  return await Order.countDocuments({
    status: 'delivered',
    updatedAt: { $gte: start.toDate(), $lte: end.toDate() }
  });
}

async function getTopProducts(start, end, limit = 5) {
  return await Order.aggregate([
    {
      $match: {
        status: 'delivered',
        updatedAt: { $gte: start.toDate(), $lte: end.toDate() }
      }
    },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.product',
        totalSold: { $sum: '$items.quantity' },
        totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
      }
    },
    { $sort: { totalSold: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'productInfo'
      }
    },
    { $unwind: '$productInfo' },
    {
      $project: {
        name: '$productInfo.name',
        totalSold: 1,
        totalRevenue: 1
      }
    }
  ]);
}

async function getSalesData(start, end, period) {
  let groupBy;
  let dateFormat;

  switch (period) {
    case 'day':
      groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } };
      dateFormat = 'YYYY-MM-DD';
      break;
    case 'week':
      groupBy = { 
        year: { $year: "$updatedAt" },
        week: { $week: "$updatedAt" }
      };
      dateFormat = 'YYYY-[W]WW';
      break;
    case 'month':
    default:
      groupBy = { $dateToString: { format: "%Y-%m", date: "$updatedAt" } };
      dateFormat = 'YYYY-MM';
  }

  const result = await Order.aggregate([
    {
      $match: {
        status: 'delivered',
        updatedAt: { $gte: start.toDate(), $lte: end.toDate() }
      }
    },
    {
      $group: {
        _id: groupBy,
        revenue: { $sum: '$totalAmount' },
        orders: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Fill in missing dates
  const filledData = [];
  let current = moment(start);
  while (current.isSameOrBefore(end)) {
    const key = current.format(dateFormat);
    const existingData = result.find(item => item._id === key);
    filledData.push({
      date: key,
      revenue: existingData ? existingData.revenue : 0,
      orders: existingData ? existingData.orders : 0
    });
    current.add(1, period);
  }

  return filledData;
}

exports.getDashboardData = async (req, res) => {
  try {
    // ... các thống kê khác ...

    const lowStockProducts = await Product.find({
      $expr: { $lte: ['$stock', '$lowStockThreshold'] }
    }).select('name stock lowStockThreshold');

    res.json({
      // ... các thống kê khác ...
      lowStockProducts
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

exports.createVoucher = async (req, res) => {
  console.log('Đang xử lý yêu cầu tạo voucher:', req.body);
  try {
    const newVoucher = new Voucher(req.body);
    console.log('Voucher mới trước khi lưu:', newVoucher);
    await newVoucher.save();
    console.log('Voucher đã được lưu vào database:', newVoucher);
    res.status(201).json(newVoucher);
  } catch (error) {
    console.error('Lỗi khi tạo voucher:', error);
    res.status(400).json({ message: 'Lỗi khi tạo voucher', error: error.message });
  }
};

exports.getAllVouchers = async (req, res) => {
  console.log('Đang xử lý yêu cầu lấy tất cả voucher');
  try {
    const vouchers = await Voucher.find();
    console.log('Vouchers từ database:', vouchers);
    res.json(vouchers);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách voucher:', error);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách voucher', error: error.message });
  }
};

exports.updateVoucher = async (req, res) => {
  try {
    const updatedVoucher = await Voucher.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedVoucher) {
      return res.status(404).json({ message: 'Không tìm thấy voucher' });
    }
    res.json(updatedVoucher);
  } catch (error) {
    res.status(400).json({ message: 'Lỗi khi cập nhật voucher', error: error.message });
  }
};

exports.deleteVoucher = async (req, res) => {
  try {
    const deletedVoucher = await Voucher.findByIdAndDelete(req.params.id);
    if (!deletedVoucher) {
      return res.status(404).json({ message: 'Không tìm thấy voucher' });
    }
    res.json({ message: 'Đã xóa voucher thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa voucher', error: error.message });
  }
};

exports.changeUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Vai trò không hợp lệ' });
    }

    const user = await User.findByIdAndUpdate(
      userId, 
      { role }, 
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error changing user role:', error);
    res.status(500).json({ message: 'Lỗi khi thay đổi vai trò người dùng' });
  }
};

