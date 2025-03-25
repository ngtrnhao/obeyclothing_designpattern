const OrderState = require("../interfaces/OderState");

class AwaitingState extends OrderState {
  constructor(order) {
    super(order);
  }
  getName() {
    return "awaiting_payment";
  }
  pending() {
    this.order.changeState("pending");
    return "Đơn hàng đã thanh toán thành công và chuyển sang trạng thái chờ xử lý";
  }
  process() {
    return "Không thể xử lý đơn hàng chưa thanh toán";
  }
  ship() {
    return "Không thể gửi đơn hàng chưa thanh toán";
  }
  deliver() {
    return "Không thể giao đơn hàng chưa thanh toán";
  }
  cancel() {
    this.order.changeState("cancelled");
    this.order.returnProductToStock();
    return "Đơn hàng bị hủy do lỗi thanh toán ";
  }
  await() {
    return "Đơn hàng đang chờ thanh toán";
  }
  canCancel() {
    return true;
  }
  canPending() {
    return true;
  }
}
module.exports = AwaitingState;
