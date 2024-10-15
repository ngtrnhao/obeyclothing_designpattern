import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getOrderById, downloadInvoice } from '../services/api';
import styles from './style.component/OrderDetails.module.css';

const OrderDetails = () => {
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await getOrderById(id);
        setOrder(response.data);
      } catch (error) {
        console.error('Error fetching order details:', error);
        if (error.response && error.response.status === 403) {
          setError('Bạn không có quyền xem chi tiết đơn hàng này.');
        } else {
          setError('Có lỗi xảy ra khi tải thông tin đơn hàng. Vui lòng thử lại sau.');
        }
      }
    };
    fetchOrder();
  }, [id]);

  const handleDownloadInvoice = async () => {
    try {
      await downloadInvoice(id);
    } catch (error) {
      console.error('Error downloading invoice:', error);
      setError('Có lỗi xảy ra khi tải xuống hóa đơn. Vui lòng thử lại sau.');
    }
  };

  if (error) return <div className={styles.error}>{error}</div>;
  if (!order) return <div className={styles.loading}>Đang tải...</div>;

  return (
    <div className={styles.orderDetails}>
      <h2>Chi tiết đơn hàng</h2>
      <p>Mã đơn hàng: {order._id}</p>
      <p>Trạng thái: {order.status}</p>
      <p>Tổng tiền: {order.totalAmount?.toLocaleString('vi-VN')} đ</p>
      
      <h3>Sản phẩm</h3>
      <ul className={styles.productList}>
        {order.items.map(item => (
          <li key={item._id}>
            {item.product.name} - Số lượng: {item.quantity} - Giá: {item.price?.toLocaleString('vi-VN')} đ
          </li>
        ))}
      </ul>
      
      <button onClick={handleDownloadInvoice} className={styles.downloadButton}>
        Tải xuống hóa đơn
      </button>
    </div>
  );
};

export default OrderDetails;