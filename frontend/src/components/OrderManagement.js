import React, { useState, useEffect } from "react";
import { getAdminOrders, updateOrderStatus } from "../services/api";
import { FaSearch, FaSort, FaEye } from "react-icons/fa";
import styles from "./style.component/OrderManagement.module.css";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await getAdminOrders();
      setOrders(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError("Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.");
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      // Tìm đơn hàng cần thay đổi trạng thái
      const order = orders.find(o => o._id === orderId);
      if (!order) {
        toast.error('Không tìm thấy đơn hàng');
        return;
      }

      // Kiểm tra transition hợp lệ trước khi gọi API
      const isValidTransition = checkValidTransition(order.status, newStatus);
      if (!isValidTransition) {
        toast.error(`Không thể chuyển từ trạng thái ${order.status} sang ${newStatus}`);
        return;
      }

      // Hiển thị thông báo đang xử lý
      toast.info("Đang cập nhật trạng thái...");
      
      const response = await updateOrderStatus(orderId, newStatus);
      
      if (response.success) {
        // Cập nhật state để UI thay đổi ngay lập tức
        setOrders(prevOrders => 
          prevOrders.map(o => o._id === orderId ? { ...o, status: newStatus } : o)
        );
        
        toast.success(response.message || `Đã cập nhật trạng thái thành ${newStatus}`);
      } else {
        toast.error(response.message || 'Không thể cập nhật trạng thái.');
      }
    } catch (error) {
      console.error("Lỗi cập nhật:", error);
      const errorMsg = error.response?.data?.message || 'Không thể cập nhật trạng thái. Vui lòng thử lại.';
      toast.error(errorMsg);
    }
  };

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const sortedOrders = React.useMemo(() => {
    let sortableOrders = [...orders];
    if (sortConfig.key !== null) {
      sortableOrders.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableOrders;
  }, [orders, sortConfig]);

  const filteredOrders = sortedOrders.filter(
    (order) =>
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.user &&
        order.user.username &&
        order.user.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.user &&
        order.user.email &&
        order.user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Pagination
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Thêm hằng số cho các trạng thái
  const ORDER_STATUS = {
    PENDING: "pending",
    PROCESSING: "processing",
    SHIPPED: "shipped",
    DELIVERED: "delivered",
    CANCELLED: "cancelled",
  };

  // Trong component OrderManagement, thêm hàm kiểm tra trạng thái
  const isStatusChangeDisabled = (currentStatus) => {
    return (
      currentStatus === ORDER_STATUS.DELIVERED ||
      currentStatus === ORDER_STATUS.CANCELLED
    );
  };

  // Thêm hàm kiểm tra chuyển đổi trạng thái hợp lệ
  const checkValidTransition = (currentStatus, newStatus) => {
    const transitions = {
      'pending': ['processing', 'cancelled'],
      'processing': ['shipped', 'cancelled'],
      'shipped': ['delivered', 'cancelled'],
      'delivered': [],
      'cancelled': [],
      'awaiting_payment': ['pending', 'cancelled']
    };
    
    return transitions[currentStatus]?.includes(newStatus) || false;
  };

  if (loading) return <div className={styles.loading}>Đang tải...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.orderManagement}>
      <h2>Quản lý đơn hàng</h2>
      <div className={styles.searchBar}>
        <FaSearch />
        <input
          type="text"
          placeholder="Tìm kiếm theo ID, tên người dùng hoặc email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <table className={styles.orderTable}>
        <thead>
          <tr>
            <th onClick={() => handleSort("_id")}>
              ID <FaSort />
            </th>
            <th onClick={() => handleSort("user.username")}>
              Người đặt <FaSort />
            </th>
            <th onClick={() => handleSort("totalAmount")}>
              Tổng tiền <FaSort />
            </th>
            <th onClick={() => handleSort("status")}>
              Trạng thái <FaSort />
            </th>
            <th>PayPal ID</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {currentOrders.map((order) => (
            <tr key={order._id}>
              <td>{order._id}</td>
              <td>
                {order.user
                  ? order.user.username || order.user.email
                  : "Không có thông tin"}
              </td>
              <td>
                {order.totalAmount?.toLocaleString("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }) || "N/A"}
              </td>
              <td>
                <span className={`${styles.status} ${styles[order.status]}`}>
                  {order.status || "N/A"}
                </span>
              </td>
              <td>{order.paypalOrderId || "N/A"}</td>
              <td>
                <div className={styles.actionButtons}>
                  <select
                    value={order.status || ""}
                    onChange={(e) =>
                      handleStatusChange(order._id, e.target.value)
                    }
                    className={styles.statusSelect}
                    disabled={isStatusChangeDisabled(order.status)}
                  >
                    <option value={ORDER_STATUS.PENDING}>Đang xử lý</option>
                    <option value={ORDER_STATUS.PROCESSING}>
                      Đang chuẩn bị
                    </option>
                    <option value={ORDER_STATUS.SHIPPED}>Đã gửi</option>
                    <option value={ORDER_STATUS.DELIVERED}>Đã giao</option>
                    <option value={ORDER_STATUS.CANCELLED}>Đã hủy</option>
                  </select>
                  <Link
                    to={`/admin/orders/${order._id}`}
                    className={`${styles.viewDetailsButton} ${
                      isStatusChangeDisabled(order.status)
                        ? styles.disabled
                        : ""
                    }`}
                    onClick={(e) =>
                      isStatusChangeDisabled(order.status) && e.preventDefault()
                    }
                  >
                    <FaEye /> Xem chi tiết
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className={styles.pagination}>
        {Array.from(
          { length: Math.ceil(filteredOrders.length / ordersPerPage) },
          (_, i) => (
            <button
              key={i}
              onClick={() => paginate(i + 1)}
              className={currentPage === i + 1 ? styles.active : ""}
            >
              {i + 1}
            </button>
          )
        )}
      </div>
    </div>
  );
};

export default OrderManagement;
