import React, { createContext, useState, useEffect, useCallback } from 'react';
import api, { getCart, removeCartItem } from '../services/api';
import { useAuth } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const { user } = useAuth();

  const fetchCart = useCallback(async () => {
    if (user) {
      try {
        const cart = await getCart();
        setCartItems(cart.items);
        calculateTotal(cart.items);
      } catch (error) {
        console.error('Error fetching cart:', error);
        setCartItems([]);
        setTotal(0);
      }
    } else {
      setCartItems([]);
      setTotal(0);
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const calculateTotal = (items) => {
    const newTotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    setTotal(newTotal);
  };

  const addToCart = async (productId, quantity = 1) => {
    try {
      await addToCart(productId, quantity);
      await fetchCart();
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  };

  const removeFromCart = async (productId) => {
    try {
      await removeCartItem(productId);
      await fetchCart();
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  };

  const updateCartItem = async (productId, quantity) => {
    try {
      await updateCartItem(productId, quantity);
      await fetchCart();
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      // Assume there's an API endpoint to clear the cart
      // await apiClearCart();
      setCartItems([]);
      setTotal(0);
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  };

  const createPayPalOrder = async () => {
    if (user) {
      try {
        const response = await api.post('/orders/create-paypal-order');
        return response.data.id;
      } catch (error) {
        console.error('Error creating PayPal order:', error);
        throw new Error('Không thể tạo đơn hàng PayPal. Vui lòng thử lại.');
      }
    } else {
      throw new Error('Vui lòng đăng nhập để tạo đơn hàng');
    }
  };

  const onPayPalApprove = async (data, actions) => {
    try {
      const details = await actions.order.capture();
      console.log('PayPal order captured:', details);
      
      const response = await api.post('/orders/complete-paypal-order', { 
        orderId: details.id,
        paypalDetails: details
      });
      
      console.log('Server response:', response.data);
      
      await clearCart();
      setCartItems([]);
      setTotal(0);
      alert('Thanh toán thành công!');
      return details;
    } catch (error) {
      console.error('Error capturing PayPal order:', error);
      alert('Có lỗi xảy ra khi xử lý thanh toán. Vui lòng thử lại.');
      throw error;
    }
  };

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      setCartItems, 
      total,
      fetchCart, 
      addToCart, 
      removeFromCart, 
      updateCartItem,
      clearCart,
      createPayPalOrder,
      onPayPalApprove
    }}>
      {children}
    </CartContext.Provider>
  );
};