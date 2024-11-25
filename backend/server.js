require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const cron = require('node-cron');

// Import middleware
const authMiddleware = require('./middleware/authMiddleware');
const adminMiddleware = require('./middleware/adminMiddleware');

// Import controllers
const inventoryController = require('./controllers/inventoryController');
const productController = require('./controllers/productController');

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const userRoutes = require('./routes/userRoutes');
const categoriesRoutes = require('./routes/categories');
const orderRoutes = require('./routes/orderRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');
const chatRoutes = require('./routes/chatRoutes');
const adminRoutes = require('./routes/adminRoutes');
const addressRoutes = require('./routes/addressRoutes');

// Load environment variables
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mydatabase';

const app = express();

// Middleware: Configure CORS
const corsOptions = {
  origin: [
    FRONTEND_URL, 
    'http://localhost:3000', 
    'https://frontend-obeyclothing.vercel.app',
    'https://mern-auth-nej2.vercel.app'
  ],
  credentials: true, // Allow cookies and credentials
};
app.use(cors(corsOptions));

// Middleware: Parse JSON
app.use(express.json());

// Middleware: Logging requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Database connection
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Serve static files from 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/user', userRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/address', addressRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/chat', chatRoutes);

// Admin routes
app.use('/api/admin', authMiddleware, adminMiddleware, adminRoutes);

// Additional routes
app.get('/api/categories/:slug/products', productController.getProductsByCategorySlug);
app.get('/api/products/slug/:slug', productController.getProductBySlug);

// Static files for frontend
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Cron jobs
cron.schedule('0 0 * * *', () => {
  inventoryController.checkAndCreatePurchaseOrders();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API is available at http://localhost:${PORT}/api`);
});

module.exports = app;
