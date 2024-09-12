const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const router = express.Router();
const checkRole = require ('../middleware/checkRole')

// Nodemailer transporter
let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
//admin
router.get('/users',checkRole('admin'),async(req,res)=>{
  try{
    const users = await User.find({},'-password');
    res.json(users);

  }catch(error){
    res.status(500).json({message:'Lỗi server'}); 

  }
  const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const User = require('../models/User');

// Áp dụng middleware xác thực và kiểm tra quyền admin cho tất cả các routes
router.use(authMiddleware);
router.use(adminMiddleware);

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Change user role
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

// Thêm các routes admin khác ở đây

module.exports = router;
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
      console.log('Admin registration attempt. Secret:', adminSecret);
      console.log('Expected admin secret:', process.env.ADMIN_SECRET);
      if (adminSecret !== process.env.ADMIN_SECRET) {
        console.log('Invalid admin secret provided');
        return res.status(403).json({ message: 'Invalid admin secret' });
      }
      userRole = 'admin';
      console.log('Admin role set successfully');
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({ 
      username, 
      email, 
      password: hashedPassword,
      role: userRole
    });
    console.log('User object before save:', user);
    await user.save();
    console.log('User saved to database:', user);
    res.status(201).json({ message: 'User created successfully', role: userRole });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});

// Đăng nhập
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Tài khoản không tồn tại' });
    }

    if (user.isLocked) {
      const timeRemaining = Math.ceil((user.lockUntil - Date.now()) / 1000 / 60);
      return res.status(403).json({ message: `Tài khoản này đã bị khóa. Vui lòng thử lại sau ${timeRemaining} phút.` });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await user.incrementLoginAttempts();
      if (user.isLocked) {
        return res.status(403).json({ message: 'Tài khoản này đã bị khóa do nhập sai mật khẩu quá 5 lần. Vui lòng thử lại sau 2 giờ.' });
      }
      return res.status(400).json({ message: `Mật khẩu không đúng. Còn ${5 - user.loginAttempts} lần thử cho tài khoản này.` });
    }

    // Reset login attempts nếu đăng nhập thành công
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, role: user.role, message: 'Đăng nhập thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Quên mật khẩu
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }
    const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    user.resetToken = resetToken;
    user.resetTokenExpiration = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;
    let mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Password Reset',
      text: `To reset your password, click on this link: ${resetUrl}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error sending email' });
      }
      res.json({ message: 'Reset password link sent to email' });
    });
  } catch (error) {
    res.status(500).json({ message: 'Error processing request', error: error.message });
  }
});

// Đặt lại mật khẩu
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const user = await User.findOne({ 
      resetToken: token, 
      resetTokenExpiration: { $gt: Date.now() } 
    });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error resetting password', error: error.message });
  }
});

module.exports = router;