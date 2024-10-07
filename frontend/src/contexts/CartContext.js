import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCart, addToCart as apiAddToCart, removeFromCart as apiRemoveFromCart } from '../services/api';
import { useAuth } from './AuthContext';
import api from '../services/api';

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
      }
    } else {
      setCartItems([]);
      setTotal(0);
    }
  }, [user]); // Add user as a dependency

  useEffect(() => {
    fetchCart();
  }, [fetchCart]); // Now fetchCart is in the dependency array

  const calculateTotal = (items) => {
    const newTotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    setTotal(newTotal);
  };

  const addToCart = async (product, quantity, size, color) => {
    try {
      if (!user) {
        throw new Error('User must be logged in to add items to cart');
      }
      await apiAddToCart({
        productId: product._id,
        quantity,
        size,
        color
      });
      await fetchCart();
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  };

  const removeFromCart = async (productId) => {
    try {
      await apiRemoveFromCart(productId);
      await fetchCart();
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const updateCartItem = async (itemId, updates) => {
    try {
      await api.put(`/cart/update/${itemId}`, updates);
      await fetchCart();
    } catch (error) {
      console.error('Error updating cart item:', error);
    }
  };

  return (
    <CartContext.Provider value={{ cartItems, total, addToCart, removeFromCart, updateCartItem, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);