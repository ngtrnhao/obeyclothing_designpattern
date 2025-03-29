const DeliveryState = require("../../interfaces/DeliveryState");

class ShippingDeliveryState extends DeliveryState {
  constructor(delivery) {
    super(delivery);
  }
  
  getName() {
    return "shipping";
  }
  
  pending() {
    return "Không thể quay lại trạng thái chờ xử lý";
  }
  
  shipping() {
    return "Đơn giao hàng đang được vận chuyển";
  }
  
  deliver() {
    return "Đơn giao hàng đã được giao thành công";
  }
  
  cancel() {
    return "Đơn giao hàng đã bị hủy trong quá trình vận chuyển";
  }
  
  canPending() {
    return false;
  }
  
  canShipping() {
    return false;
  }
  
  canDeliver() {
    return true;
  }
  
  canCancel() {
    return true;
  }
}

module.exports = ShippingDeliveryState;