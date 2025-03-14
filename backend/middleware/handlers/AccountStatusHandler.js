const BaseHandler = require("./BaseHandler");

class AccountStatusHandler extends BaseHandler {
  async handle(req) {
    console.log('AccountStatusHandler - Start');
    const user = req.originalUser;
    console.log('Checking user status:', {
      isActive: user.isActive,
      isLocked: user.isLocked,
      lockUntil: user.lockUntil
    });
    
    if (!user.isActive) {
      console.log('Account is inactive');
      throw new Error(
        "Tài khoản của bạn đã bị khóa, vui lòng liên hệ admin để được hỗ trợ!"
      );
    }
    
    if (user.isLocked) {
      const remainingTime = Math.ceil((user.lockUntil - Date.now()) / (60 * 1000));
      console.log('Account is temporarily locked:', { remainingTime });
      throw new Error(
        `Tài khoản tạm thời bị khóa. Vui lòng thử lại sau ${remainingTime} phút.`
      );
    }

    console.log('AccountStatusHandler - Success');
    return await super.handle(req);
  }
}
module.exports = AccountStatusHandler;
