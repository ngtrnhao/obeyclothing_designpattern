const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'Không có token, quyền truy cập bị từ chối' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        
        if (!user) {
            return res.status(401).json({ message: 'Không tìm thấy người dùng' });
        }

        // Kiểm tra trạng thái tài khoản
        if (!user.isActive) {
            return res.status(403).json({ 
                message: 'Tài khoản của bạn đã bị khóa',
                status: 'locked'
            });
        }

        // Kiểm tra tài khoản có đang bị tạm khóa
        if (user.isLocked) {
            return res.status(403).json({
                message: 'Tài khoản đang bị tạm khóa',
                status: 'temporary_locked'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token không hợp lệ' });
    }
};

module.exports = authMiddleware;
