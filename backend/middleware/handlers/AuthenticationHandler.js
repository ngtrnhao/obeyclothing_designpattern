const BaseHandler = require("./BaseHandler");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");

class AuthenticationHandler extends BaseHandler {
  async handle(req) {
    try {
      console.log('=== AuthenticationHandler Start ===');
      console.log('Path:', req.path);
      console.log('Method:', req.method);
      console.log('Headers:', req.headers);

      const token = req.header("Authorization")?.replace("Bearer ", "");
      console.log('Token:', token ? token.substring(0, 10) + '...' : 'missing');

      if (!token) {
        throw new Error("Token không tồn tại");
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Decoded token:', decoded);

      const user = await User.findById(decoded.userId)
        .select('-password')
        .lean();
      
      console.log('User found:', user ? {
        id: user._id,
        email: user.email,
        role: user.role
      } : 'not found');

      if (!user) {
        throw new Error("Người dùng không tồn tại");
      }

      // Lưu thông tin user gốc để các handler sau có thể sử dụng
      req.originalUser = user;
      
      req.user = {
        ...user,
        userId: user._id,
        roles: [user.role]
      };
      console.log('AuthenticationHandler - User set:', req.user);

      console.log('=== AuthenticationHandler Success ===');
      return await super.handle(req);
    } catch (error) {
      console.error('=== AuthenticationHandler Error ===', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      if (error.name === 'JsonWebTokenError') {
        throw new Error("Token không hợp lệ");
      }
      throw error;
    }
  }
}

module.exports = AuthenticationHandler;
