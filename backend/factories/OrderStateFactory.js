const PendingState = require("../states/orderState/PendingState");
const AwaitingState = require("../states/orderState/AwaitingState");
const ShippedState = require("../states/orderState/ShippedState");
const DeliverState = require("../states/orderState/DeliveredState");
const CancelledState = require("../states/orderState/CancelledState");
const ProcessingState = require("../states/orderState/ProcessingState");

class OrderStateFactory {
  static createState(stateName, order) {
    switch (stateName) {
      case "pending":
        return new PendingState(order);
      case "awaiting_payment":
        return new AwaitingState(order);
      case "processing":
        return new ProcessingState(order);
      case "shipped":
        return new ShippedState(order);
      case "delivered":
        return new DeliverState(order);
      case "cancelled":
        return new CancelledState(order);
      default:
        return new PendingState(order);
    }
  }
}
module.exports = OrderStateFactory;
