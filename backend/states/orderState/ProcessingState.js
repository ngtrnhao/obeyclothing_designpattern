const OrderState = require("../../interfaces/OderState");

class ProcessingState extends OrderState {
  constructor(order) {
    super(order);
  }
  getName() {
    return "processing";
  }
  pending() {
    return "Không thể quay lại trạng thái chờ xử lý";
  }
  process() {
    return "Đơn hàng đang được xử lý";
  }
  ship() {
    // Cập nhật trực tiếp các thông tin cần thiết
    this.order.shippedAt = new Date();

    // Chỉ trả về thông báo, không gọi changeState()
    return "Đơn hàng đã được chuyển sang trạng thái gửi hàng";
  }
  deliver() {
    return "Không thể giao đơn hàng đang được xử lý";
  }
  cancel() {
    this.order.cancelledAt = new Date();
    this.order.returnProductToStock();
    return "Đơn hàng đã bị hủy trong quá trình xử lý";
  }
  await() {
    return "Không thể chuyển đơn hàng đang xử lý về trạng thái chờ thanh toán";
  }
  canProcess() {
    return false;
  }
  canShip() {
    console.log("[DEBUG] Đang kiểm tra canShip() trong ProcessingState");
    const result = true;
    console.log(`[DEBUG] canShip() trả về: ${result}`);
    return result;
  }
  canDeliver() {
    return false;
  }
  canCancel() {
    return true;
  }
  canAwait() {
    return false;
  }
  canPending() {
    return false;
  }
}
module.exports = ProcessingState;
