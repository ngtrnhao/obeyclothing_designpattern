const DeliveryState = require("../../interfaces/DeliveryState");

class CancelledDeliveryState extends DeliveryState {
  constructor(delivery) {
    super(delivery);
  }

  getName() {
    return "cancelled";
  }

  pending() {
    return "Đơn hàng đã bị hủy, không thể thay đổi trạng thái";
  }

  shipping() {
    return "Đơn hàng đã bị hủy, không thể thay đổi trạng thái";
  }

  deliver() {
    return "Đơn hàng đã bị hủy, không thể thay đổi trạng thái";
  }

  cancel() {
    return "Đơn hàng đã bị hủy";
  }

  canPending() {
    return false;
  }

  canShipping() {
    return false;
  }

  canDeliver() {
    return false;
  }

  canCancel() {
    return false;
  }
}

module.exports = CancelledDeliveryState;
