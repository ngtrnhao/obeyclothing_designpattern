import React, { useState, useEffect } from 'react';
import { getCart, updateCartItem, removeCartItem, createOrder } from '../services/api';
import { useNavigate } from 'react-router-dom';
import styles from './style.component/Cart.module.css';

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await getCart();
      setCart(response.data);
    } catch (error) {
      setError('Không thể tải giỏ hàng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (productId, newQuantity) => {
    try {
      await updateCartItem(productId, newQuantity);
      fetchCart();
    } catch (error) {
      setError('Không thể cập nhật số lượng. Vui lòng thử lại.');
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      await removeCartItem(productId);
      fetchCart();
    } catch (error) {
      setError('Không thể xóa sản phẩm. Vui lòng thử lại.');
    }
  };

  const handleCheckout = async () => {
    try {
      await createOrder(); // Thay đổi từ checkout() sang createOrder()
      alert('Đặt hàng thành công!');
      navigate('/orders');
    } catch (error) {
      setError('Không thể hoàn tất đơn hàng. Vui lòng thử lại.');
    }
  };

  if (loading) return <div>Đang tải giỏ hàng...</div>;
  if (error) return <div>{error}</div>;
  if (!cart || cart.items.length === 0) return <div>Giỏ hàng trống</div>;

  return (
    <div className={styles.cart}>
      <h2>Giỏ hàng của bạn</h2>
      {cart.items.map(item => (
        <div key={item.product._id} className={styles.cartItem}>
          <img src={item.product.image} alt={item.product.name} className={styles.productImage} />
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
        <h3>Tổng cộng: {cart.total.toLocaleString('vi-VN')} đ</h3>
        <button onClick={handleCheckout} className={styles.checkoutButton}>Thanh toán</button>
      </div>
    </div>
  );
};

export default Cart;
