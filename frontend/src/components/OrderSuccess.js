import React from 'react';
import { Link } from 'react-router-dom';
import styles from './style.component/OrderSuccess.module.css';

const OrderSuccess = () => {
  return (
    <div className={styles.orderSuccessContainer}>
      <h2>Đặt hàng thành công!</h2>
      <p>Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đã được xác nhận.</p>
      <Link to="/" className={styles.homeButton}>Quay lại trang chủ</Link>
    </div>
  );
};

export default OrderSuccess;