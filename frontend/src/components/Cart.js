// eslint-disable-next-line unicode-bom
import React, { useContext, useEffect, useState } from 'react';
import { updateCartItem, removeCartItem, createOrder } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../contexts/CartContext';
import styles from './style.component/Cart.module.css';

const Cart = () => {
  const { cartItems, setCartItems } = useContext(CartContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Cart Items:', cartItems);
    if (cartItems.length > 0) {
      setLoading(false);
    }
  }, [cartItems]);

  const handleUpdateQuantity = async (productId, newQuantity) => {
    try {
      await updateCartItem(productId, newQuantity);
      const updatedCartItems = cartItems.map(item => 
        item.product._id === productId ? { ...item, quantity: newQuantity } : item
      );
      setCartItems(updatedCartItems);
    } catch (error) {
      setError('Không thể cập nhật số lượng. Vui lòng thử lại.');
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      await removeCartItem(productId);
      const updatedCartItems = cartItems.filter(item => item.product._id !== productId);
      setCartItems(updatedCartItems);
    } catch (error) {
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
      setError('Không thể hoàn tất đơn hàng. Vui lòng thử lại.');
    }
  };

  if (loading) return <div>Đang tải giỏ hàng...</div>;
  if (error) return <div>{error}</div>;
  if (!cartItems || cartItems.length === 0) return <div>Giỏ hàng trống</div>;

  const total = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

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
      </div>
    </div>
  );
};

export default Cart;
