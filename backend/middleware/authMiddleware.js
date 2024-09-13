const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  console.log('JWT_SECRET in auth middleware:', process.env.JWT_SECRET);
  const token = req.header('Authorization')?.replace('Bearer ', '');
  console.log('Received token:', token);
  
  if (!token) {
    return res.status(401).json({ message: 'Không có token, quyền truy cập bị từ chối' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ message: 'Token không hợp lệ' });
  }
};

module.exports = authMiddleware;