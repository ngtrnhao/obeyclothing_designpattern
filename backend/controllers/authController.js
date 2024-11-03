const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendResetPasswordEmail } = require('../utils/emailService');

exports.register = async (req, res) => {
  try {
    const { username, email, password, role, adminSecret } = req.body;
    console.log('Registration attempt:', { username, email, role, adminSecret });

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

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
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Tài khoản không tồn tại' });
    }

    if (!user.isActive) {
      return res.status(403).json({ 
        message: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ email: admin@obeyclothing.com để được hỗ trợ.',
        status: 'locked'
      });
    }

    if (user.isLocked) {
      const remainingTime = Math.ceil((user.lockUntil - Date.now()) / (60 * 1000));
      return res.status(403).json({
        message: `Tài khoản tạm thời bị khóa. Vui lòng thử lại sau ${remainingTime} phút.`,
        status: 'temporary_locked',
        remainingTime
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await user.incrementLoginAttempts();
      return res.status(400).json({ message: 'Mật khẩu không đúng' });
    }

    if (user.loginAttempts > 0) {
      user.loginAttempts = 0;
      user.lockUntil = undefined;
      await user.save();
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Server error during login:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng với email này' });
    }
    
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetUrl = `http://ObeyClothing/reset-password/${resetToken}`;
    await sendResetPasswordEmail(email, resetUrl);

    res.json({ message: 'Liên kết đặt lại mật khẩu đã được gửi đến email của bạn' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Lỗi xử lý yêu cầu', error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    
    console.log('Received token:', token);
    console.log('Received password:', password);

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    console.log('Found user:', user);

    if (!user) {
      return res.status(400).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    console.log('Password reset successful');

    res.json({ message: 'Mật khẩu đã được đặt lại thành công' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Lỗi khi đặt lại mật khẩu', error: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

exports.changeUserRole = async (req, res) => {
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
};