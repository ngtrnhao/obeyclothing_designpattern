const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  resetToken: String,
  resetTokenExpiration: Date,
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date }
});
userSchema.pre('save', function(next) {
    if (this.isModified('lockUntil') && this.lockUntil && this.lockUntil < Date.now()) {
      this.loginAttempts = 0;
      this.lockUntil = null;
    }
    next();
  });
module.exports = mongoose.model('User', userSchema);