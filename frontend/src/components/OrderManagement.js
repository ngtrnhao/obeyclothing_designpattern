import React, { useState, useEffect } from 'react';
import { getOrders } from '../services/api';
import styles from './style.component/Orders.module.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await getOrders();
      setOrders(response.data);
    } catch (error) {
      setError('Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Đang tải đơn hàng...</div>;
  if (error) return <div>{error}</div>;
  if (orders.length === 0) return <div>Bạn chưa có đơn hàng nào.</div>;

  return (
    <div className={styles.orders}>
      <h2>Lịch sử đơn hàng</h2>
      {orders.map(order => (
        <div key={order._id} className={styles.orderItem}>
          <h3>Đơn hàng #{order._id}</h3>
          <p>Ngày đặt: {new Date(order.createdAt).toLocaleDateString()}</p>
          <p>Trạng thái: {order.status}</p>
          <p>Tổng tiền: {order.total.toLocaleString('vi-VN')} đ</p>
          <h4>Sản phẩm:</h4>
          <ul>
            {order.items.map(item => (
              <li key={item.product._id}>
                {item.product.name} - Số lượng: {item.quantity} - Giá: {item.price.toLocaleString('vi-VN')} đ
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default Orders;