const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const router = express.Router();

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
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
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
  
      // Kiểm tra xem tài khoản cụ thể này có đang bị khóa không
      if (user.lockUntil && user.lockUntil > Date.now()) {
        const timeRemaining = Math.ceil((user.lockUntil - Date.now()) / 1000 / 60);
        return res.status(403).json({
          message: `Tài khoản này đã bị khóa. Vui lòng thử lại sau ${timeRemaining} phút.`
        });
      }
  
      const isMatch = await bcrypt.compare(password, user.password);
  
      if (!isMatch) {
        // Tăng số lần đăng nhập thất bại cho tài khoản cụ thể này
        user.loginAttempts += 1;
        
        if (user.loginAttempts >= 5) {
          user.lockUntil = Date.now() + 2 * 60 * 60 * 1000; // Khóa trong 2 giờ
          await user.save();
          return res.status(403).json({
            message: 'Tài khoản này đã bị khóa do nhập sai mật khẩu quá 5 lần. Vui lòng thử lại sau 2 giờ.'
          });
        }
  
        await user.save();
        return res.status(400).json({
          message: `Mật khẩu không đúng. Còn ${5 - user.loginAttempts} lần thử cho tài khoản này.`
        });
      }
  
      // Đăng nhập thành công, reset số lần thử và mở khóa tài khoản
      user.loginAttempts = 0;
      user.lockUntil = null;
      await user.save();
  
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: '1h'
      });
  
      res.json({ token, message: 'Đăng nhập thành công' });
    } catch (error) {
      console.error(error);
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