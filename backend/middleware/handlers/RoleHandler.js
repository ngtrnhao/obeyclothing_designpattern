const BaseHandler = require("./BaseHandler");

class RoleHandler extends BaseHandler {
  constructor(requiredRole) {
    super();
    this.requiredRole = requiredRole;
  }

  async handle(req) {
    console.log('RoleHandler - Start', {
      requiredRole: this.requiredRole,
      userRoles: req.user.roles
    });

    // Admin có thể truy cập mọi route
    if (req.user.roles.includes('admin')) {
      console.log('RoleHandler - Admin access granted');
      return await super.handle(req);
    }

    // Kiểm tra role cho user thường
    if (!req.user.roles.includes(this.requiredRole)) {
      throw new Error("Không có quyền truy cập");
    }

    console.log('RoleHandler - Success');
    return await super.handle(req);
  }
}

module.exports = RoleHandler;
