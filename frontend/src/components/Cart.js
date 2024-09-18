import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../contexts/CartContext';
import { updateCartItem, removeCartItem, createOrder } from '../services/api';
import PayPalCheckout from './PayPalCheckout1';
import styles from './style.component/Cart.module.css';

const Cart = () => {
  const { cartItems, setCartItems, total, fetchCart } = useContext(CartContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart().then(() => setLoading(false)).catch(err => {
      console.error('Error fetching cart:', err);
      setError('Không thể tải giỏ hàng. Vui lòng thử lại.');
      setLoading(false);
    });
  }, [fetchCart]);

  const handleUpdateQuantity = async (productId, newQuantity) => {
    try {
      await updateCartItem(productId, newQuantity);
      await fetchCart();
    } catch (error) {
      console.error('Error updating quantity:', error);
      setError('Không thể cập nhật số lượng. Vui lòng thử lại.');
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      await removeCartItem(productId);
      await fetchCart();
    } catch (error) {
      console.error('Error removing item:', error);
      setError('Không thể xóa sản phẩm. Vui lòng thử lại.');
    }
  };

  const handleCheckout = async () => {
    try {
      await createOrder();
      setCartItems([]);
      alert('Đặt hàng thành công!');
      navigate('/orders');
    } catch (error) {
      console.error('Error during checkout:', error);
      setError('Không thể hoàn tất đơn hàng. Vui lòng thử lại.');
    }
  };

  if (loading) return <div>Đang tải giỏ hàng...</div>;
  if (error) return <div>{error}</div>;

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className={styles.emptyCart}>
        <h2>Giỏ hàng trống</h2>
        <p>Bạn chưa có sản phẩm nào trong giỏ hàng.</p>
        <Link to="/products" className={styles.continueShopping}>Tiếp tục mua sắm</Link>
      </div>
    );
  }

  return (
    <div className={styles.cart}>
      <h2>Giỏ hàng của bạn</h2>
      {cartItems.map(item => (
        <div key={item.product._id} className={styles.cartItem}>
          <img 
            src={`${process.env.REACT_APP_API_URL}${item.product.image}`} 
            alt={item.product.name} 
            className={styles.productImage} 
          />
          <div className={styles.productInfo}>
            <h3>{item.product.name}</h3>
            <p>Giá: {item.product.price.toLocaleString('vi-VN')} đ</p>
            <div className={styles.quantityControl}>
              <button onClick={() => handleUpdateQuantity(item.product._id, item.quantity - 1)} disabled={item.quantity === 1}>-</button>
              <span>{item.quantity}</span>
              <button onClick={() => handleUpdateQuantity(item.product._id, item.quantity + 1)}>+</button>
            </div>
            <button onClick={() => handleRemoveItem(item.product._id)} className={styles.removeButton}>Xóa</button>
          </div>
        </div>
      ))}
      <div className={styles.cartSummary}>
        <h3>Tổng cộng: {total.toLocaleString('vi-VN')} đ</h3>
        <button onClick={handleCheckout} className={styles.checkoutButton}>Thanh toán</button>
        <PayPalCheckout />
      </div>
    </div>
  );
};

export default Cart;
