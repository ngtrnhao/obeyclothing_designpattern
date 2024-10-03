import React from 'react';
import { useCart } from '../contexts/CartContext';
import PayPalCheckout from './PayPalCheckout1';
import styles from './style.component/Checkout.module.css';

const Checkout = () => {
  const { cartItems, total } = useCart();

  if (cartItems.length === 0) {
    return <div>Giỏ hàng trống</div>;
  }

  const usdTotal = total / 23000; // Giả sử tỷ giá 1 USD = 23000 VND

  return (
    <div className={styles.checkoutContainer}>
      <h2>Thanh toán</h2>
      <div className={styles.orderSummary}>
        <h3>Tổng quan đơn hàng</h3>
        {cartItems.map((item) => (
          <div key={item.product._id} className={styles.cartItem}>
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