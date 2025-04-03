const DeliveryState = require("../../interfaces/IDeliveryState");

class PendingDeliveryState extends DeliveryState {
  constructor(delivery) {
    super(delivery);
  }

  getName() {
    return "pending";
  }

  pending() {
    return "Đơn giao hàng đang chờ xử lý";
  }

  shipping() {
    return "Đơn giao hàng đã được chuyển sang trạng thái đang giao";
  }

  deliver() {
    return "Không thể giao hàng khi chưa bắt đầu vận chuyển";
  }

  cancel() {
    return "Đơn giao hàng đã bị hủy";
  }

  canPending() {
    return false;
  }

  canShipping() {
    return true;
  }

  canDeliver() {
    return false;
  }

  canCancel() {
    return true;
  }
}

module.exports = PendingDeliveryState;
