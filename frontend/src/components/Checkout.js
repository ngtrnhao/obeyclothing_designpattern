import React, { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import PayPalCheckout from './PayPalCheckout1';
import styles from './style.component/Checkout.module.css';

const Checkout = () => {
  const { cart, total } = useCart();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (cart.length > 0) {
      setIsLoading(false);
    }
  }, [cart]);

  if (isLoading) {
    return <div>Đang tải...</div>;
  }

  const usdTotal = total / 23000; // Giả sử tỷ giá 1 USD = 23000 VND

  return (
    <div className={styles.checkoutContainer}>
      <h2>Thanh toán</h2>
      <div className={styles.orderSummary}>
        <h3>Tổng quan đơn hàng</h3>
        {cart.map((item) => (
          <div key={item._id} className={styles.cartItem}>
            <span>{item.product.name}</span>
            <span>{item.quantity} x {item.product.price.toLocaleString('vi-VN')} đ</span>
          </div>
        ))}
        <div className={styles.total}>
          <strong>Tổng cộng: {total.toLocaleString('vi-VN')} đ</strong>
          <div>(${usdTotal.toFixed(2)} USD)</div>
        </div>
      </div>
      <div className={styles.paypalContainer}>
        <PayPalCheckout amount={usdTotal} />
      </div>
    </div>
  );
};

export default Checkout;