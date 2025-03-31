const DeliveryState = require("../../interfaces/DeliveryState");

class DeliveredDeliveryState extends DeliveryState {
  constructor(delivery) {
    super(delivery);
  }
  
  getName() {
    return "delivered";
  }
  
  pending() {
    return "Đơn hàng đã giao thành công, không thể thay đổi trạng thái";
  }
  
  shipping() {
    return "Đơn hàng đã giao thành công, không thể thay đổi trạng thái";
  }
  
  deliver() {
    return "Đơn hàng đã giao thành công";
  }
  
  cancel() {
    return "Đơn hàng đã giao thành công, không thể hủy đơn hàng";
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

module.exports = DeliveredDeliveryState;