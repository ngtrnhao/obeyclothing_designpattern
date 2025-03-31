const OrderState = require("../../interfaces/OderState");

const CancelledState = class extends OrderState {
  constructor(order) {
    super(order);
  }
  getName() {
    return "cancelled";
  }
  pending() {
    return "Không thể thay đổi trạng thái của đơn hàng đã hủy";
  }
  process() {
    return "Không thể thay đổi trạng thái của đơn hàng đã hủy";
  }
  ship() {
    return "Không thể thay đổi trạng thái của đơn hàng đã hủy";
  }
  deliver() {
    return "Không thể thay đổi trạng thái của đơn hàng đã hủy";
  }
  cancel() {
    return "Đơn hàng đã được hủy";
  }
  await() {
    return "Không thể chuyển đơn hàng đã hủy về trạng thái chờ thanh toán";
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
    return false;
  }
  canCancel() {
    return false;
  }
  canAwait() {
    return false;
  }
};
module.exports = CancelledState;
