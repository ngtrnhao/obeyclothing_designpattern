import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import styles from './style.component/OrderConfirmation.module.css';

const OrderConfirmation = () => {
  const location = useLocation();
  const { orderId } = location.state || {};

  return (
    <div className={styles.confirmationContainer}>
      <h2>Đơn hàng đã được xác nhận</h2>
      {orderId && <p>Mã đơn hàng của bạn là: {orderId}</p>}
      <p>Cảm ơn bạn đã mua hàng. Chúng tôi sẽ xử lý đơn hàng của bạn trong thời gian sớm nhất.</p>
      <Link to="/" className={styles.homeLink}>Quay về trang chủ</Link>
    </div>
  );
};

export default OrderConfirmation;