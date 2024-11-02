const cron = require('node-cron');
const User = require('../models/User');

// Chạy mỗi phút để kiểm tra và mở khóa tài khoản
cron.schedule('* * * * *', async () => {
  try {
    const result = await User.updateMany(
      {
        lockUntil: { $lt: Date.now() },
        loginAttempts: { $gt: 0 }
      },
      {
        $set: { loginAttempts: 0 },
        $unset: { lockUntil: 1 }
      }
    );
    
    if (result.modifiedCount > 0) {
      console.log(`${result.modifiedCount} tài khoản đã được tự động mở khóa`);
    }
  } catch (error) {
    console.error('Lỗi trong quá trình tự động mở khóa tài khoản:', error);
  }
}); 