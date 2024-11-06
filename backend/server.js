const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const authMiddleware = require('./middleware/authMiddleware');
const adminMiddleware = require('./middleware/adminMiddleware');
const cron = require('node-cron');
const inventoryController = require('./controllers/inventoryController');
const deliveryRoutes = require('./routes/deliveryRoutes');


dotenv.config();

console.log('ADMIN_SECRET:', process.env.ADMIN_SECRET);

const app = express();

// Cấu hình CORS
app.use(cors({
  origin: 'http://localhost:3000', // Thay đổi thành URL của frontend của bạn
  credentials: true
}));

// Thêm middleware này sau middleware CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

app.use(express.json());

app.use((req, res, next) => {
  console.log(`Incoming ${req.method} request to ${req.path}`);
  console.log('Request body:', req.body);
  next();
});

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch((err) => console.error('MongoDB connection error:', err));

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
//const userRoutes = require('./routes/user');
const categoryRoutes = require('./routes/categories');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const categoriesRoutes = require('./routes/categories');
const addressRoutes = require('./routes/addressRoutes');

// Đặt route admin trước các route khác
app.use('/api/admin', authMiddleware, adminMiddleware, (req, res, next) => {
  console.log('Admin route accessed');
  next();
}, adminRoutes);

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/products', (req, res, next) => {
  console.log('Request to /api/products:', req.method, req.url);
  next();
}, productRoutes);
app.use('/api/cart', cartRoutes);
//app.use('/api/user', userRoutes);
//Admin routes
app.use('/api/user', userRoutes);

/*app.use('/api/categories', categoryRoutes);*/
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/address', addressRoutes);

const productController = require('./controllers/productController');
console.log(productController); // Kiểm tra xem object này có chứa hàm getProductsByCategorySlug không

// Add this line after other route definitions
app.get('/api/categories/:slug/products', productController.getProductsByCategorySlug);

app.get('/api/products/slug/:slug', productController.getProductBySlug);

const inventoryRoutes = require('./routes/inventoryRoutes');

// Thêm dòng này vào phần sử dụng routes
app.use('/api/inventory', inventoryRoutes);

const supplierRoutes = require('./routes/supplierRoutes');

// Thêm dòng này vào phần khai báo routes
app.use('/api/suppliers', supplierRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API URL: http://localhost:${PORT}/api`);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Đã xảy ra lỗi server', error: err.message });
});

// Chạy mỗi ngày lúc 00:00
cron.schedule('0 0 * * *', () => {
  inventoryController.checkAndCreatePurchaseOrders();
});

// Sau đó mới đến các route khác và static files
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Add admin routes
app.use('/api', adminRoutes);

// Add route for delivery management
app.use('/api/admin/deliveries', require('./routes/deliveryRoutes'));
app.use('/api/deliveries', deliveryRoutes);

// Import cronJobs
require('./utils/cronJobs');


module.exports = app;
