import React, { useState, useEffect } from 'react';
import { getDeliveries, updateDeliveryStatus } from '../services/api';
import styles from './style.component/DeliveryManagement.module.css'

const DeliveryManagement = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const response = await getDeliveries();
      if (Array.isArray(response.data)) {
        const validDeliveries = response.data.filter(delivery => delivery && delivery._id);
        setDeliveries(validDeliveries);
      } else {
        console.error('Unexpected API response:', response);
        setError('Dữ liệu không hợp lệ từ máy chủ.');
      }
    } catch (error) {
      console.error('Error fetching deliveries:', error);
      setError('Không thể tải danh sách giao hàng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (deliveryId, newStatus) => {
    try {
      const response = await updateDeliveryStatus(deliveryId, newStatus);
      if (response && response.data && response.data.delivery && response.data.order) {
        const { delivery, order } = response.data;
        setDeliveries(prevDeliveries => 
          prevDeliveries.map(d => 
            d._id === delivery._id ? { ...d, status: delivery.status, order: { ...d.order, status: order.status } } : d
          )
        );
      } else {
        console.error('Unexpected response from updateDeliveryStatus:', response);
        setError('Không thể cập nhật trạng thái giao hàng. Dữ liệu không hợp lệ.');
      }
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
      {deliveries.length === 0 ? (
        <p>Không có đơn giao hàng nào.</p>
      ) : (
        <table className={styles.deliveryTable}>
          <thead>
            <tr>
              <th>Mã đơn hàng</th>
              <th>Mã PayPal</th>
              <th>Người đặt</th>
              <th>Địa chỉ giao hàng</th>
              <th>Trạng thái giao hàng</th>
              <th>Trạng thái đơn hàng</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {deliveries.map(delivery => delivery && (
              <tr key={delivery._id}>
                <td>{delivery.order?._id || 'N/A'}</td>
                <td>{delivery.order?.paypalOrderId || 'N/A'}</td>
                <td>{delivery.order?.user ? delivery.order.user.username || delivery.order.user.email : 'Không có thông tin'}</td>
                <td>
                  {delivery.shippingInfo ? 
                    `${delivery.shippingInfo.address || ''}, ${delivery.shippingInfo.wardName || ''}, ${delivery.shippingInfo.districtName || ''}, ${delivery.shippingInfo.provinceName || ''}`.trim() 
                    : 'Chưa có địa chỉ'}
                </td>
                <td>{delivery.status || 'N/A'}</td>
                <td>{delivery.order?.status || 'N/A'}</td>
                <td>
                  <select
                    value={delivery.status || ''}
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
      )}
    </div>
  );
}

export default DeliveryManagement;
