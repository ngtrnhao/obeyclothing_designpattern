import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCart, addToCart as apiAddToCart, removeFromCart as apiRemoveFromCart } from '../services/api';
import { useAuth } from './AuthContext';
import api from '../services/api';
import axios from 'axios';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [voucher, setVoucher] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [finalAmount, setFinalAmount] = useState(0);
  const { user } = useAuth();

  const fetchCart = useCallback(async () => {
    if (user) {
      try {
        const cart = await getCart();
        setCartItems(cart.items);
      } catch (error) {
        console.error('Error fetching cart:', error);
      }
    } else {
      setCartItems([]);
      setTotal(0);
    }
  }, [user]); 

  useEffect(() => {
    fetchCart();
  }, [fetchCart]); 

  // Calculate total whenever cartItems change
  useEffect(() => {
    const newTotal = cartItems.reduce((sum, item) => 
      sum + (item.quantity * item.product.price), 0
    );
    setTotal(newTotal);
    setFinalAmount(newTotal - (discountAmount || 0));
  }, [cartItems, discountAmount]);

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

  const applyVoucher = (newVoucher, newDiscountAmount, newFinalAmount) => {
    setVoucher(newVoucher);
    setDiscountAmount(newDiscountAmount);
    setFinalAmount(newFinalAmount);
  };

  const clearVoucher = useCallback(async () => {
    try {
      await axios.post('/api/cart/clear-voucher');
      setVoucher(null);
      setDiscountAmount(0);
      setFinalAmount(total);
    } catch (error) {
      console.error('Lỗi khi xóa voucher:', error);
    }
  }, [total]);

  const clearCart = useCallback(async () => {
    try {
      await api.post('/cart/clear');
      setCartItems([]);
      setTotal(0);
      clearVoucher();
    } catch (error) {
      console.error('Lỗi khi xóa giỏ hàng:', error);
    }
  }, [clearVoucher]);

  const value = {
    cartItems,
    setCartItems,
    total,
    voucher,
    discountAmount,
    finalAmount,
    applyVoucher,
    clearVoucher,
    fetchCart,
    removeFromCart,
    updateCartItem,
    addToCart,
    clearCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
