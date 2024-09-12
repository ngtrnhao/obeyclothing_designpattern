const checkRole = (role) => {
    return (req, res, next) => {
      if (req.user && req.user.role === role) {
        next();
      } else {
        res.status(403).json({ message: 'Không có quyền truy cập' });
      }
    }
  };
  
  module.exports = checkRole;