import React from 'react';
import styles from './style.component/CartError.module.css';

const CartError = ({ error, resetErrorBoundary }) => {
  return (
    <div className={styles.errorContainer}>
      <h2>Đã xảy ra lỗi!</h2>
      <p>{error.message}</p>
      <button 
        onClick={resetErrorBoundary}
        className={styles.retryButton}
      >
        Thử lại
      </button>
    </div>
  );
};

export default CartError;