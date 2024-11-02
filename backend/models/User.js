const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: props => `${props.value} is not a valid email address!`
    }
  },
  password: { 
    type: String, 
    required: true,
    minlength: [8, 'Password must be at least 8 characters long']
  },
  fullName: { 
    type: String, 
    trim: true,
    maxlength: [100, 'Full name cannot exceed 100 characters']
  },
  phoneNumber: { 
    type: String, 
    validate: {
      validator: function(v) {
        return /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(v);
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  },
  address: { type: String, required: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  loginAttempts: { type: Number, required: true, default: 0 },
  lockUntil: { type: Date },
  isActive: { type: Boolean, default: true },
  shippingInfo: { type: mongoose.Schema.Types.ObjectId, ref: 'ShippingInfo' }
}, { timestamps: true });

userSchema.index({ lockUntil: 1 });

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
    updates.$set = { lockUntil: Date.now() + 5 * 60 * 1000 };
  }
  return this.updateOne(updates);
};

userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

module.exports = mongoose.model('User', userSchema);
