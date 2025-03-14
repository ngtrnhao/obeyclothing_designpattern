// backend/middleware/chainMiddleware.js
const AuthenticationHandler = require('./handlers/AuthenticationHandler');
const AccountStatusHandler = require('./handlers/AccountStatusHandler');
const RoleHandler = require('./handlers/RoleHandler');

// Middleware xác thực cơ bản sử dụng Chain of Responsibility
const authChainMiddleware = (req, res, next) => {
  try {
    // Khởi tạo chuỗi handler cơ bản: xác thực -> kiểm tra trạng thái tài khoản
    const authHandler = new AuthenticationHandler();
    const statusHandler = new AccountStatusHandler();
    
    // Thiết lập chuỗi
    authHandler.setNext(statusHandler);
    
    // Bắt đầu xử lý chuỗi
    authHandler.handle(req)
      .then(() => {
        // Xử lý thành công, chuyển sang middleware tiếp theo
        next();
      })
      .catch(error => {
        // Xử lý lỗi
        console.error('Auth Chain Error:', error.message);
        res.status(401).json({ message: error.message });
      });
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Middleware cho admin
const adminChainMiddleware = (req, res, next) => {
  try {
    // Khởi tạo và thiết lập chuỗi: xác thực -> kiểm tra trạng thái -> kiểm tra role admin
    const authHandler = new AuthenticationHandler();
    const statusHandler = new AccountStatusHandler();
    const roleHandler = new RoleHandler('admin');
    
    // Thiết lập chuỗi
    authHandler.setNext(statusHandler);
    statusHandler.setNext(roleHandler);
    
    // Bắt đầu xử lý chuỗi
    authHandler.handle(req)
      .then(() => {
        next();
      })
      .catch(error => {
        console.error('Admin Auth Chain Error:', error.message);
        res.status(403).json({ message: error.message });
      });
  } catch (error) {
    console.error('Admin Middleware Error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Tạo middleware với role tùy chỉnh
const createRoleChainMiddleware = (role) => {
  return (req, res, next) => {
    try {
      const authHandler = new AuthenticationHandler();
      const statusHandler = new AccountStatusHandler();
      const roleHandler = new RoleHandler(role);
      
      authHandler.setNext(statusHandler);
      statusHandler.setNext(roleHandler);
      
      authHandler.handle(req)
        .then(() => next())
        .catch(error => {
          console.error(`${role} Auth Chain Error:`, error.message);
          res.status(403).json({ message: error.message });
        });
    } catch (error) {
      console.error(`${role} Middleware Error:`, error);
      res.status(500).json({ message: 'Lỗi server' });
    }
  };
};

// Tạo middleware với chuỗi handler tùy chỉnh
const createCustomChainMiddleware = (handlers) => {
  return (req, res, next) => {
    try {
      if (handlers.length === 0) {
        return next();
      }
      
      // Thiết lập chuỗi
      for (let i = 0; i < handlers.length - 1; i++) {
        handlers[i].setNext(handlers[i + 1]);
      }
      
      // Bắt đầu xử lý
      handlers[0].handle(req)
        .then(() => next())
        .catch(error => {
          console.error('Custom Chain Error:', error.message);
          res.status(401).json({ message: error.message });
        });
    } catch (error) {
      console.error('Custom Middleware Error:', error);
      res.status(500).json({ message: 'Lỗi server' });
    }
  };
};

module.exports = {
  authChainMiddleware,
  adminChainMiddleware,
  createRoleChainMiddleware,
  createCustomChainMiddleware
};