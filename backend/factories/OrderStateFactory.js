const PendingState = require("../states/orderState/PendingOrderState");
const AwaitingState = require("../states/orderState/AwaitingOrderState");
const ShippedState = require("../states/orderState/ShippedOrderState");
const DeliverState = require("../states/orderState/DeliveredOrderState");
const CancelledState = require("../states/orderState/CancelledOrderState");
const ProcessingState = require("../states/orderState/ProcessingOrderState");

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
