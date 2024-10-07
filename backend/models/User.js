const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String, required: false },
  phoneNumber: { type: String, required: false },
  address: {
    street: { type: String, required: false },
    city: { type: String, required: false },
    state: { type: String, required: false },
    zipCode: { type: String, required: false },
    country: { type: String, required: false }
  },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  loginAttempts: { type: Number, required: true, default: 0 },
  lockUntil: { type: Number },
  isActive: { type: Boolean, default: true },
  shippingInfo: {
    fullName: String,
    email: String,
    phone: String,
    address: String,
    province: String,
    district: String,
    ward: String
  }
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