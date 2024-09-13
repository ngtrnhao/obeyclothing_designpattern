import React, { useState, useEffect } from 'react';
import { getCart, updateCartItem, removeCartItem } from '../services/api';
import styles from './style.component/Cart.module.css';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await getCart();
        setCartItems(response.data.items);
      } catch (error) {
        console.error('Error fetching cart:', error);
      }
    };
    fetchCart();
  }, []);

  const handleQuantityChange = async (itemId, newQuantity) => {
    try {
      await updateCartItem(itemId, newQuantity);
      setCartItems(cartItems.map(item => 
        item._id === itemId ? { ...item, quantity: newQuantity } : item
      ));
    } catch (error) {
      console.error('Error updating cart item:', error);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await removeCartItem(itemId);
      setCartItems(cartItems.filter(item => item._id !== itemId));
    } catch (error) {
      console.error('Error removing cart item:', error);
    }
  };

  const total = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <div className={styles.cart}>
      <h2 className={styles.cartTitle}>Giỏ hàng</h2>
      {cartItems.map(item => (
        <div key={item._id} className={styles.cartItem}>
          <img src={item.product.image} alt={item.product.name} className={styles.itemImage} />
          <div className={styles.itemInfo}>
            <h3 className={styles.itemName}>{item.product.name}</h3>
            <p className={styles.itemPrice}>{item.product.price.toLocaleString('vi-VN')} đ</p>
          </div>
          <input 
            type="number" 
            value={item.quantity} 
            onChange={(e) => handleQuantityChange(item._id, Math.max(1, parseInt(e.target.value)))}
            min="1"
            className={styles.quantityInput}
          />
          <button onClick={() => handleRemoveItem(item._id)} className={styles.removeButton}>Xóa</button>
        </div>
      ))}
      <div className={styles.cartTotal}>
        <h3 className={styles.totalAmount}>Tổng cộng: {total.toLocaleString('vi-VN')} đ</h3>
        <button className={styles.checkoutButton}>Thanh toán</button>
      </div>
    </div>
  );
};

export default Cart;
