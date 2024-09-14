const adminMiddleware = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Không có thông tin người dùng' });
    }

    console.log('User role:', req.user.role);
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Chỉ admin mới có quyền truy cập' });
    }
    next();
};

module.exports = adminMiddleware;