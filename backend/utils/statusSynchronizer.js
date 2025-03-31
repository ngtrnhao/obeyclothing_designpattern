// backend/utils/statusSynchronizer.js
/**
 * Module quản lý đồng bộ trạng thái giữa Delivery và Order
 */

// Quy tắc chuyển đổi trạng thái hợp lệ cho Order
const ORDER_FLOW = {
    'pending': ['processing', 'cancelled', 'awaiting_payment'],
    'processing': ['shipped', 'cancelled'],
    'shipped': ['delivered', 'cancelled'],
    'delivered': [],
    'cancelled': [],
    'awaiting_payment': ['pending', 'cancelled']
  };
  
  // Quy tắc chuyển đổi trạng thái hợp lệ cho Delivery
  const DELIVERY_FLOW = {
    'pending': ['shipping', 'cancelled'],
    'shipping': ['delivered', 'cancelled'],
    'delivered': [],
    'cancelled': []
  };
  
  // Ánh xạ từ trạng thái Delivery sang trạng thái Order cuối cùng
  const DELIVERY_TO_ORDER_FINAL_MAP = {
    'pending': 'pending',
    'shipping': 'shipped',
    'delivered': 'delivered',
    'cancelled': 'cancelled'
  };
  
  // Ánh xạ từ trạng thái Delivery sang trạng thái trung gian của Order (nếu cần)
  const DELIVERY_TO_ORDER_INTERIM_MAP = {
    'pending': null,
    'shipping': 'processing',  // Khi shipping cần qua processing trước khi shipped
    'delivered': null,
    'cancelled': null
  };
  
  /**
   * Đồng bộ trạng thái đơn hàng theo trạng thái giao hàng
   * @param {Object} order - Đối tượng Order
   * @param {String} deliveryStatus - Trạng thái giao hàng mới
   * @returns {Promise<Object>} - Kết quả đồng bộ
   */
  exports.synchronizeOrderWithDelivery = async (order, deliveryStatus) => {
    console.log(`[SYNC] Bắt đầu đồng bộ Order từ ${order.status} theo trạng thái Delivery ${deliveryStatus}`);
    
    // Xác định trạng thái cuối cùng mong muốn
    const finalOrderStatus = DELIVERY_TO_ORDER_FINAL_MAP[deliveryStatus];
    if (!finalOrderStatus) {
      return { 
        success: false, 
        message: `Không thể xác định trạng thái đơn hàng tương ứng với ${deliveryStatus}` 
      };
    }
    
    // Nếu đã ở trạng thái đích, không cần làm gì
    if (order.status === finalOrderStatus) {
      return { success: true, message: `Đơn hàng đã ở trạng thái ${finalOrderStatus}` };
    }
    
    // Xác định nếu cần một trạng thái trung gian
    const interimStatus = DELIVERY_TO_ORDER_INTERIM_MAP[deliveryStatus];
    
    // Trường hợp shipping rất đặc biệt: pending -> processing -> shipped
    if (deliveryStatus === 'shipping' && order.status === 'pending') {
      console.log(`[SYNC] Cần xử lý trạng thái trung gian: ${order.status} -> ${interimStatus} -> ${finalOrderStatus}`);
      
      // Bước 1: Chuyển sang trạng thái trung gian
      const interimResult = await order.changeState(interimStatus);
      if (!interimResult.success) {
        return {
          success: false,
          message: `Không thể chuyển sang trạng thái trung gian: ${interimResult.message}`
        };
      }
      
      // Bước 2: Chuyển sang trạng thái cuối
      return await order.changeState(finalOrderStatus);
    }
    
    // Các trường hợp khác, thử chuyển trực tiếp
    return await order.changeState(finalOrderStatus);
  };
  
  // Export các hằng số để sử dụng ở nơi khác
  exports.ORDER_FLOW = ORDER_FLOW;
  exports.DELIVERY_FLOW = DELIVERY_FLOW;
  exports.DELIVERY_TO_ORDER_FINAL_MAP = DELIVERY_TO_ORDER_FINAL_MAP;