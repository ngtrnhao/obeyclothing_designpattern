class OrderState {
  constructor(order) {
    this.order = order;
  }
  pending() {
    throw new Error("Phương thức pending cần được triển khai");
  }
  process() {
    throw new Error("Phương thức process cần được triển khai ");
  }
  ship() {
    throw new Error("Phương thức ship cần được triển khai");
  }
  deliver() {
    throw new Error("Phương thức deliver cần được triển khai");
  }
  cancel() {
    throw new Error("Phương thức cancel cần được triển khai ");
  }
  await() {
    throw new Error("Phương thức await cần được triển khai");
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
  canPending() {
    return false;
  }
  //Phương thức trả về tên trạng thái
  getName() {
    throw new Error("Phương thức getStateName cần được triển khai");
  }
}
module.exports = OrderState;
