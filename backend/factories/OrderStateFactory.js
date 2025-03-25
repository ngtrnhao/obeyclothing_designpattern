const PendingState = require("../states/PendingState");
const AwaitingState = require("../states/AwaitingState");
const ShippedState = require("../states/ShippedState");
const DeliverState = require("../states/DeliveredState");
const CancelledState = require("../states/CancelledState");
const ProcessingState = require("../states/ProcessingState");

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
