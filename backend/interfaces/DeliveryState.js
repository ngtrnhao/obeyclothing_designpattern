class DeliveryState {
  constructor(delivery) {
    this.delivery = delivery;
  }
  pending() {
    throw new Error("Phương thức pending cần được triển khai ");
  }
  shipping() {
    throw new Error("Phương thức shipping cần được triển khai ");
  }
  deliver() {
    throw new Error("Phương thức deliver cần được triển khai ");
  }
  cancel() {
    throw new Error("Phương thức cancel cần được triển khai");
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
  getName() {
    throw new Error("Phương thức getName cần được triển khai");
  }
}
module.exports = DeliveryState;
