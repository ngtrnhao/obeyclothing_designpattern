const OrderState = require("../interfaces/OderState");

const ShippedState = class extends OrderState {
  constructor(order) {
    super(order);
  }
  getName() {
    return "shipped";
  }
  pending() {
    return "Không thể quay lại trạng thái chờ xử lý";
  }
  process() {
    return "Không thể quay lại trạng thái xử lý";
  }
  ship() {
    return "Đơn hàng đã được gửi đi ";
  }
  deliver() {
    this.order.deliveredAt = new Date();
    return "Đơn hàng đã được giao thành công";
  }
  cancel() {
    this.order.cancelledAt = new Date();
    this.order.returnProductToStock();
    return "Đơn hàng đã bị hủy trong quá trình xử lý";
  }
  await() {
    return "Không thể chuyển đơn hàng đã gửi về trạng thái chờ thanh toán";
  }
  canPending() {
    return false;
  }

  canProcess() {
    return false;
  }

  canShip() {
    return false;
  }

  canDeliver() {
    return true;
  }

  canCancel() {
    return true;
  }

  canAwait() {
    return false;
  }
};
module.exports = ShippedState;
