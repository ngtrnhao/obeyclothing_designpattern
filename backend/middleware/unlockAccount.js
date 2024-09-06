userSchema.pre('save', function(next) {
    if (this.isModified('lockUntil') && this.lockUntil && this.lockUntil < Date.now()) {
      this.loginAttempts = 0;
      this.lockUntil = null;
    }
    next();
  });