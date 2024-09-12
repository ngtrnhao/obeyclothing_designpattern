const adminMiddleware = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ message: 'Chỉ admin mới được phép truy cập' });
    }
  };
  
  module.exports = adminMiddleware;