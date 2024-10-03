import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../contexts/CartContext';
import styles from './style.component/Cart.module.css';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, total } = useContext(CartContext);

  if (cartItems.length === 0) {
    return (
      <div className={styles.emptyCart}>
        <h2>Giỏ hàng trống</h2>
        <Link to="/products" className={styles.continueShopping}>Tiếp tục mua sắm</Link>
      </div>
    );
  }

  return (
    <div className={styles.cart}>
      <h2>Giỏ hàng của bạn</h2>
      {cartItems.map(item => (
        <div key={item.product._id} className={styles.cartItem}>
          <img src={`${process.env.REACT_APP_API_URL}/uploads/${item.product.image}`} alt={item.product.name} className={styles.productImage} />
          <div className={styles.productInfo}>
            <h3>{item.product.name}</h3>
            <p>Giá: {item.product.price.toLocaleString('vi-VN')} đ</p>
            <div className={styles.quantityControl}>
              <button onClick={() => updateQuantity(item.product._id, item.quantity - 1)} disabled={item.quantity === 1}>-</button>
              <span>{item.quantity}</span>
              <button onClick={() => updateQuantity(item.product._id, item.quantity + 1)}>+</button>
            </div>
            <button onClick={() => removeFromCart(item.product._id)} className={styles.removeButton}>Xóa</button>
          </div>
        </div>
      ))}
      <div className={styles.cartSummary}>
        <h3>Tổng cộng: {total.toLocaleString('vi-VN')} đ</h3>
        <Link to="/checkout" className={styles.checkoutButton}>Thanh toán</Link>
      </div>
    </div>
  );
};

export default Cart;
