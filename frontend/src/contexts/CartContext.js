import React, { createContext, useState, useEffect, useCallback } from 'react';
import { getCart } from '../services/api';
import { useAuth } from './AuthContext'; // Thêm dòng này

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const { user } = useAuth(); // Thêm dòng này

  const fetchCart = useCallback(async () => {
    if (user) {
      try {
        const cart = await getCart();
        setCartItems(cart.items);
      } catch (error) {
        console.error('Error fetching cart:', error);
        setCartItems([]);
      }
    } else {
      setCartItems([]);
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  return (
    <CartContext.Provider value={{ cartItems, setCartItems, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};