import React, { useState, useEffect } from 'react';
import { getDeliveries, updateDeliveryStatus } from '../services/api';
import styles from './style.component/DeliveryManagement.module.css';

const DeliveryManagement = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      const response = await getDeliveries();
      setDeliveries(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching deliveries:', error);
      setError('Không thể tải danh sách giao hàng. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };

  const handleStatusChange = async (deliveryId, newStatus) => {
    try {
      await updateDeliveryStatus(deliveryId, newStatus);
      fetchDeliveries();
    } catch (error) {
      console.error('Error updating delivery status:', error);
      setError('Không thể cập nhật trạng thái giao hàng. Vui lòng thử lại.');
    }
  };

  if (loading) return <div className={styles.loading}>Đang tải...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.deliveryManagement}>
      <h2>Quản lý giao hàng</h2>
      <table className={styles.deliveryTable}>
        <thead>
          <tr>
            <th>Mã đơn hàng</th>
            <th>Địa chỉ giao hàng</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {deliveries.map(delivery => (
            <tr key={delivery._id}>
              <td>{delivery._id}</td>
              <td>{delivery.order.paypalOrderId || 'N/A'}</td>
              <td>{delivery.order.user ? delivery.order.user.username || delivery.order.user.email : 'Không có thông tin'}</td>
              <td>{delivery.shippingAddress || 'Chưa có địa chỉ'}</td>
              <td>{delivery.status}</td>
              <td>
                <select
                  value={delivery.status}
                  onChange={(e) => handleStatusChange(delivery._id, e.target.value)}
                  className={styles.statusSelect}
                >
                  <option value="pending">Chờ xử lý</option>
                  <option value="shipping">Đang giao hàng</option>
                  <option value="delivered">Đã giao hàng</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DeliveryManagement;