const OrderState = require("../../interfaces/OderState");

class PendingState extends OrderState {
  constructor(order) {
    super(order);
  }
  getName() {
    return "pending";
  }
  pending() {
    return false;
  }
  process() {
    this.order.processedAt = new Date();
    return "Đơn hàng đang được xử lý";
  }
  ship() {
    return "Không thể chuyển đơn hàng chờ xử lý sang trạng thái gửi hàng";
  }
  deliver() {
    return "Không thể giao đơn hàng chờ xử lý";
  }
  cancel() {
    this.order.cancelledAt = new Date();
    this.order.returnProductToStock();
    return "Đơn hàng đã bị hủy";
  }
  await() {
    return "Đơn hàng đã ở trạng thái chờ xử lý";
  }
  canProcess() {
    return true;
  }
  canCancel() {
    return true;
  }
  canShip() {
    return false;
  }
  canDeliver() {
    return false;
  }
  canAwait() {
    return false;
  }
  canPending() {
    return false;
  }
  canProcessing() {
    return true;
  }
}
module.exports = PendingState;
