const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

console.log('ADMIN_SECRET:', process.env.ADMIN_SECRET);

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`Incoming ${req.method} request to ${req.path}`);
  console.log('Request body:', req.body);
  next();
});

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.log(err));

// Import routes
const authRoutes = require('./routes/auth');

// Use routes
app.use('/api/auth', authRoutes);
//Admin routes
// const adminRoutes = require('./routes/adminRoutes');
// app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.log('Address in use, retrying...');
    setTimeout(() => {
      server.close();
      server.listen(PORT);
    }, 1000);
  }
});