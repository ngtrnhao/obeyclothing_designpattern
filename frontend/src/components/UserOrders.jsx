import React, { useState, useEffect } from 'react';
import { getUserOrders, cancelOrder } from '../services/api';
import styles from './style.component/UserOrders.module.css';
import { Link } from 'react-router-dom';

const UserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserOrders();
  }, []);

  const fetchUserOrders = async () => {
    try {
      const response = await getUserOrders();
      setOrders(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user orders:', error);
      setError('Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
      try {
        await cancelOrder(orderId);
        alert('Đơn hàng đã được hủy thành công');
        fetchUserOrders(); // Refresh danh sách đơn hàng
      } catch (error) {
        console.error('Error cancelling order:', error);
        alert(error.response?.data?.message || 'Không thể hủy đơn hàng. Vui lòng thử lại.');
      }
    }
  };

  const canCancelOrder = (status) => {
    return ['pending', 'processing'].includes(status);
  };

  if (loading) return <div className={styles.loading}>Đang tải...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (orders.length === 0) return <div className={styles.noOrders}>Bạn chưa có đơn hàng nào.</div>;

  return (
    <div className={styles.userOrders}>
      <h2>Đơn hàng của tôi</h2>
      <table className={styles.ordersTable}>
        <thead>
          <tr>
            <th>Mã đơn hàng</th>
            <th>Ngày đặt</th>
            <th>Tổng tiền</th>
            <th>Trạng thái</th>
            <th>Chi tiết</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order._id}>
              <td>{order._id}</td>
              <td>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
              <td>{order.totalAmount.toLocaleString('vi-VN')}đ</td>
              <td>
                <span className={`${styles.orderStatus} ${styles[order.status]}`}>
                  {order.status}
                </span>
              </td>
              <td>
                <Link to={`/user/orders/${order._id}`} className={styles.viewButton}>
                  Xem chi tiết
                </Link>
                {canCancelOrder(order.status) && (
                  <button 
                    onClick={() => handleCancelOrder(order._id)}
                    className={styles.cancelButton}
                  >
                    Hủy đơn hàng
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserOrders;
