const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  loginAttempts: { type: Number, required: true, default: 0 },
  lockUntil: { type: Number },
  isActive: { type: Boolean, default: true },
});

userSchema.pre('save', function(next) {
  if (this.isModified('lockUntil') && this.lockUntil && this.lockUntil < Date.now()) {
    this.loginAttempts = 0;
    this.lockUntil = undefined;
  }
  next();
});

userSchema.methods.incrementLoginAttempts = function() {
  // Nếu lockUntil đã hết hạn, reset loginAttempts
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }
  // Nếu không, tăng loginAttempts
  const updates = { $inc: { loginAttempts: 1 } };
  // Khóa tài khoản nếu đạt đến số lần thử tối đa
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 };
  }
  return this.updateOne(updates);
};

userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

module.exports = mongoose.model('User', userSchema);