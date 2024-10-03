import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { useAuth } from './AuthContext';

export const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const { user } = useAuth();

  const calculateTotal = useCallback(() => {
    const newTotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    setTotal(newTotal);
  }, [cartItems]);

  useEffect(() => {
    calculateTotal();
  }, [calculateTotal]);

  const addToCart = (product, quantity) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.product._id === product._id);
      if (existingItem) {
        return prevItems.map(item =>
          item.product._id === product._id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prevItems, { product, quantity }];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.product._id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity > 0) {
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.product._id === productId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const createPayPalOrder = async () => {
    try {
      const response = await fetch('/api/create-paypal-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: cartItems }),
      });
      const order = await response.json();
      return order.id;
    } catch (error) {
      console.error('Error creating PayPal order:', error);
    }
  };

  const onPayPalApprove = async (data, actions) => {
    try {
      const details = await actions.order.capture();
      const response = await fetch('/api/complete-paypal-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderID: data.orderID,
          paypalDetails: details,
        }),
      });
      const result = await response.json();
      setCartItems([]);
      return result;
    } catch (error) {
      console.error('Error completing PayPal order:', error);
    }
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      total,
      createPayPalOrder,
      onPayPalApprove
    }}>
      {children}
    </CartContext.Provider>
  );
};