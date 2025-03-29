const PendingDeliveryState = require("../states/deliveryState/PendingDeliveryState");
const ShippingDeliveryState = require("../states/deliveryState/ShippingDeliveryState");
const DeliveredDeliveryState = require("../states/deliveryState/DeliveredDeliveryState");
const CancelledDeliveryState = require("../states/deliveryState/CancelledDelivery");

class DeliveryStateFactory {
  static createState(stateName, delivery) {
    switch (stateName) {
      case "pending":
        return new PendingDeliveryState(delivery);
      case "shipping":
        return new ShippingDeliveryState(delivery);
      case "delivered":
        return new DeliveredDeliveryState(delivery);
      case "cancelled":
        return new CancelledDeliveryState(delivery);
      default:
        return new PendingDeliveryState(delivery);
    }
  }
}

module.exports = DeliveryStateFactory;
