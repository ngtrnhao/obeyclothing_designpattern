const OrderState = require("../../interfaces/OderState");

const DeliverState = class extends OrderState {
  constructor(order) {
    super(order);
  }
  getName() {
    return "delivered";
  }
  pending() {
    return "Đơn hàng đã giao thành công, không thể thay đổi trạng thái";
  }
  process() {
    return "Đơn hàng đã giao thành công, không thể thay đổi trạng thái";
  }
  ship() {
    return "Đơn hàng đã giao thành công, không thể thay đổi trạng thái";
  }
  deliver() {
    return "Đơn hàng đã giao thành công";
  }
  cancel() {
    return "Đơn hàng đã giao thành công, không thể hủy đơn hàng";
  }
  await() {
    return "Đơn hàng đã giao thành công, không thể chờ thanh toán";
  }
  // Thêm các phương thức canXXX
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
module.exports = DeliverState;
