import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCart({ items: [] });
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await cartAPI.get();
      setCart(response.data || { items: [] });
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCart({ items: [] });
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productQuantityId, quantity = 1) => {
    try {
      const response = await cartAPI.add(productQuantityId, quantity);
      setCart(response.data);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to add to cart' };
    }
  };

  const updateQuantity = async (productQuantityId, quantity) => {
    try {
      const response = await cartAPI.update(productQuantityId, quantity);
      setCart(response.data);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to update quantity' };
    }
  };

  const removeFromCart = async (productQuantityId) => {
    try {
      const response = await cartAPI.remove(productQuantityId);
      setCart(response.data);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to remove from cart' };
    }
  };

  const clearCart = async () => {
    try {
      await cartAPI.clear();
      setCart({ items: [] });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to clear cart' };
    }
  };

  const getCartTotal = () => {
    return cart.items.reduce((total, item) => {
      return total + (item.productQuantity.price * item.qty);
    }, 0);
  };

  const getCartItemsCount = () => {
    return cart.items.reduce((count, item) => count + item.qty, 0);
  };

  const value = {
    cart,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartItemsCount,
    fetchCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};