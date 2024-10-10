const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');

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
    const totalRevenue = await calculateTotalRevenue();
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments();
    const topProducts = await getTopProducts();
    const monthlySales = await getMonthlySales();

    res.json({
      totalRevenue,
      totalOrders,
      totalUsers,
      topProducts,
      monthlySales
    });
  } catch (error) {
    console.error('Error in getStatistics:', error);
    res.status(500).json({ message: 'Error fetching statistics', error: error.message });
  }
};

async function calculateTotalRevenue() {
  const result = await Order.aggregate([
    { $group: { _id: null, total: { $sum: '$totalAmount' } } }
  ]);
  return result[0]?.total || 0;
}

async function getTopProducts(limit = 5) {
  return await Product.aggregate([
    { $sort: { soldQuantity: -1 } },
    { $limit: limit },
    { $project: { name: 1, soldQuantity: 1 } }
  ]);
}

async function getMonthlySales() {
  const currentYear = new Date().getFullYear();
  const result = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: new Date(`${currentYear}-01-01`), $lt: new Date(`${currentYear + 1}-01-01`) }
      }
    },
    {
      $group: {
        _id: { $month: '$createdAt' },
        revenue: { $sum: '$totalAmount' }
      }
    },
    {
      $project: {
        _id: 0,
        month: '$_id',
        revenue: 1
      }
    },
    { $sort: { month: 1 } }
  ]);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return monthNames.map((name, index) => {
    const monthData = result.find(item => item.month === index + 1);
    return {
      month: name,
      revenue: monthData ? monthData.revenue : 0
    };
  });
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