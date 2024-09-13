const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const router = express.Router();
const checkRole = require('../middleware/checkRole');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Nodemailer transporter
let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Đăng ký
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role, adminSecret } = req.body;
    console.log('Registration attempt:', { username, email, role, adminSecret });

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Determine role
    let userRole = 'user';
    if (role === 'admin') {
      if (adminSecret !== process.env.ADMIN_SECRET) {
        return res.status(403).json({ message: 'Invalid admin secret' });
      }
      userRole = 'admin';
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({ 
      username, 
      email, 
      password: hashedPassword,
      role: userRole
    });
    await user.save();
    res.status(201).json({ message: 'User created successfully', role: userRole });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});

// Đăng nhập
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt:', { email, password: '******' });
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Tài khoản không tồn tại' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mật khẩu không đúng' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    console.log('Generated token:', token);
    console.log('Login successful for user:', user.email);
    res.json({ token, role: user.role, message: 'Đăng nhập thành công' });
  } catch (error) {
    console.error('Server error during login:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Quên mật khẩu
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng với email này' });
    }
    
    const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    user.resetToken = resetToken;
    user.resetTokenExpiration = Date.now() + 3600000; // 1 hour
    await user.save();

    console.log('Reset token created:', resetToken);
    console.log('Reset token expiration:', user.resetTokenExpiration);

    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;
    let mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Đặt lại mật khẩu',
      text: `Để đặt lại mật khẩu, vui lòng nhấp vào liên kết sau: ${resetUrl}. Liên kết này sẽ hết hạn sau 1 giờ.`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('Error sending email:', error);
        return res.status(500).json({ message: 'Lỗi khi gửi email' });
      }
      console.log('Email sent:', info.response);
      res.json({ message: 'Liên kết đặt lại mật khẩu đã được gửi đến email của bạn' });
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Lỗi xử lý yêu cầu', error: error.message });
  }
});

// Đặt lại mật khẩu
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    console.log('Received token:', token);
    console.log('Received new password:', newPassword);

    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token và mật khẩu mới là bắt buộc' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Decoded token:', decoded);
    } catch (error) {
      console.log('Token verification error:', error);
      return res.status(400).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
    }

    const user = await User.findOne({ 
      _id: decoded.userId,
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() } 
    });

    if (!user) {
      console.log('User not found or token expired');
      return res.status(400).json({ message: 'Người dùng không tồn tại hoặc token đã hết hạn' });
    }

    console.log('User found:', user);

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();

    console.log('Password reset successful');
    res.json({ message: 'Mật khẩu đã được đặt lại thành công' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Lỗi khi đặt lại mật khẩu', error: error.message });
  }
});

// Admin routes
router.use(authMiddleware);
router.use(adminMiddleware);

// Get all users (admin only)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Change user role (admin only)
router.patch('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Vai trò không hợp lệ' });
    }

    const user = await User.findByIdAndUpdate(userId, { role }, { new: true });

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Route test
router.get('/test', (req, res) => {
  res.json({ message: 'Auth route is working' });
});

module.exports = router;