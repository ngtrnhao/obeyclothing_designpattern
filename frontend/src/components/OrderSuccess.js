import React from 'react';
import { Link, useParams } from 'react-router-dom';
import styles from './style.component/OrderSuccess.module.css';

const OrderSuccess = () => {
  const { orderId } = useParams();

  return (
    <div className={styles.successContainer}>
      <div className={styles.successContent}>
        <div className={styles.successIcon}>
          <i className="fas fa-check-circle"></i>
        </div>
        <h1>Đặt hàng thành công!</h1>
        <p>Cảm ơn bạn đã đặt hàng. Mã đơn hàng của bạn là:</p>
        <div className={styles.orderId}>{orderId}</div>
        <p>Chúng tôi sẽ sớm liên hệ với bạn để xác nhận đơn hàng.</p>
        <div className={styles.actions}>
          <Link to="/user/orders" className={styles.viewOrderButton}>
            Xem đơn hàng
          </Link>
          <Link to="/" className={styles.continueButton}>
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;