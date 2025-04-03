// backend/utils/statusSynchronizer.js
/**
 * Module quản lý đồng bộ trạng thái giữa Delivery và Order
 */

// Quy tắc chuyển đổi trạng thái hợp lệ cho Order
const ORDER_FLOW = {
  pending: ["processing", "cancelled", "awaiting_payment"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
  awaiting_payment: ["pending", "cancelled"],
};

// Quy tắc chuyển đổi trạng thái hợp lệ cho Delivery
const DELIVERY_FLOW = {
  pending: ["shipping", "cancelled"],
  shipping: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

// Ánh xạ từ trạng thái Delivery sang trạng thái Order cuối cùng
const DELIVERY_TO_ORDER_FINAL_MAP = {
  pending: "pending",
  shipping: "shipped",
  delivered: "delivered",
  cancelled: "cancelled",
};

// Ánh xạ từ trạng thái Delivery sang trạng thái trung gian của Order (nếu cần)
const DELIVERY_TO_ORDER_INTERIM_MAP = {
  pending: null,
  shipping: "processing", // Khi shipping cần qua processing trước khi shipped
  delivered: null,
  cancelled: null,
};
const ORDER_TO_DELIVERY_MAP = {
  pending: "pending",
  processing: "pending",
  shipped: "shipping",
  delivered: "delivered",
  cancelled: "cancelled",
  awaiting_payment: "pending",
};

/**
 * Đồng bộ trạng thái đơn hàng theo trạng thái giao hàng
 * @param {Object} order - Đối tượng Order
 * @param {String} deliveryStatus - Trạng thái giao hàng mới
 * @returns {Promise<Object>} - Kết quả đồng bộ
 */
exports.synchronizeOrderWithDelivery = async (order, deliveryStatus) => {
  console.log(
    `[SYNC] Bắt đầu đồng bộ Order từ ${order.status} theo trạng thái Delivery ${deliveryStatus}`
  );

  // Xác định trạng thái cuối cùng mong muốn
  const finalOrderStatus = DELIVERY_TO_ORDER_FINAL_MAP[deliveryStatus];
  if (!finalOrderStatus) {
    return {
      success: false,
      message: `Không thể xác định trạng thái đơn hàng tương ứng với ${deliveryStatus}`,
    };
  }

  // Nếu đã ở trạng thái đích, không cần làm gì
  if (order.status === finalOrderStatus) {
    return {
      success: true,
      message: `Đơn hàng đã ở trạng thái ${finalOrderStatus}`,
    };
  }

  // Xác định nếu cần một trạng thái trung gian
  const interimStatus = DELIVERY_TO_ORDER_INTERIM_MAP[deliveryStatus];

  // Trường hợp shipping rất đặc biệt: pending -> processing -> shipped
  if (deliveryStatus === "shipping" && order.status === "pending") {
    console.log(
      `[SYNC] Cần xử lý trạng thái trung gian: ${order.status} -> ${interimStatus} -> ${finalOrderStatus}`
    );

    // Bước 1: Chuyển sang trạng thái trung gian
    const interimResult = await order.changeState(interimStatus);
    if (!interimResult.success) {
      return {
        success: false,
        message: `Không thể chuyển sang trạng thái trung gian: ${interimResult.message}`,
      };
    }

    // Bước 2: Chuyển sang trạng thái cuối
    return await order.changeState(finalOrderStatus);
  }

  // Các trường hợp khác, thử chuyển trực tiếp
  return await order.changeState(finalOrderStatus);
};
/**
 * Đồng bộ trạng thái giao hàng theo trạng thái đơn hàng
 * @param {Object} delivery - Đối tượng Delivery
 * @param {String} orderStatus - Trạng thái đơn hàng mới
 * @returns {Promise<Object>} - Kết quả đồng bộ
 */
exports.synchronizeDeliveryWithOrder = async (delivery, orderStatus) => {
  console.log(
    `[SYNC] Bắt đầu đồng bộ Delivery từ ${delivery.status} theo trạng thái Order ${orderStatus}`
  );

  // Xác định trạng thái Delivery tương ứng
  const targetDeliveryStatus = ORDER_TO_DELIVERY_MAP[orderStatus];
  if (!targetDeliveryStatus) {
    return {
      success: false,
      message: `Không thể xác định trạng thái giao hàng tương ứng với ${orderStatus}`,
    };
  }

  // Nếu đã ở trạng thái đích, không cần làm gì
  if (delivery.status === targetDeliveryStatus) {
    return {
      success: true,
      message: `Giao hàng đã ở trạng thái ${targetDeliveryStatus}`,
    };
  }
  // Trong hàm synchronizeDeliveryWithOrder

  // Trường hợp đặc biệt: Nếu Order shipped nhưng Delivery vẫn ở pending
  if (orderStatus === "shipped" && delivery.status === "pending") {
    console.log(
      `[SYNC] Đơn hàng shipped nhưng giao hàng chưa bắt đầu - cập nhật sang shipping`
    );
    return await delivery.changeState("shipping");
  }

  // Trường hợp đặc biệt: Nếu Order delivered nhưng Delivery chưa delivered
  if (orderStatus === "delivered" && delivery.status !== "delivered") {
    if (delivery.status === "pending") {
      // Nếu Delivery vẫn đang pending, cần đi qua trạng thái shipping trước
      console.log(
        `[SYNC] Cần xử lý trạng thái trung gian: ${delivery.status} -> shipping -> delivered`
      );

      // Bước 1: Chuyển sang shipping
      const interimResult = await delivery.changeState("shipping");
      if (!interimResult.success) {
        return {
          success: false,
          message: `Không thể chuyển sang trạng thái trung gian: ${interimResult.message}`,
        };
      }
    }

    // Bước cuối: Chuyển sang delivered
    return await delivery.changeState("delivered");
  }
  // Kiểm tra nếu chuyển đổi là hợp lệ
  const currentDeliveryFlow = DELIVERY_FLOW[delivery.status] || [];
  if (!currentDeliveryFlow.includes(targetDeliveryStatus)) {
    return {
      success: false,
      message: `Không thể chuyển trực tiếp từ ${delivery.status} sang ${targetDeliveryStatus}`,
    };
  }

  // Thực hiện thay đổi trạng thái
  return await delivery.changeState(targetDeliveryStatus);
};

exports.ORDER_TO_DELIVERY_MAP = ORDER_TO_DELIVERY_MAP;
exports.ORDER_FLOW = ORDER_FLOW;
exports.DELIVERY_FLOW = DELIVERY_FLOW;
exports.DELIVERY_TO_ORDER_FINAL_MAP = DELIVERY_TO_ORDER_FINAL_MAP;
