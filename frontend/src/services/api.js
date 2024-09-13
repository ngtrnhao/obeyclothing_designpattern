/* eslint-disable unicode-bom */
import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

// Tạo một instance của axios với cấu hình mặc định
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Hàm để set token vào header của mọi request
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Interceptor để thêm token vào header của mỗi request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('Sending token:', token);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Authentication
export const login = async (email, password) => {
  console.log('API login called with:', { email, password: '******' });
  try {
    const response = await api.post('/auth/login', { email, password });
    console.log('API login response:', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.error('API login error:', error.response?.data || error.message);
    throw error;
  }
};

export const register = async (username, email, password, role, adminSecret) => {
  console.log('Gửi yêu cầu đăng ký đến server...');
  try {
    const response = await api.post('/auth/register', { username, email, password, role, adminSecret });
    console.log('Nhận phản hồi từ server:', response);
    return response;
  } catch (error) {
    console.error('Lỗi trong quá trình đăng ký:', error);
    throw error;
  }
};
export const forgotPassword = (email) => api.post('/auth/forgot-password', { email });
export const resetPassword = async (token, newPassword) => {
  try {
    console.log('Sending token:', token);
    console.log('Sending new password:', newPassword);
    const response = await api.post('/auth/reset-password', { token, newPassword });
    console.log('Reset password response:', response);
    return response;
  } catch (error) {
    console.error('Reset password error:', error.response?.data || error.message);
    throw error;
  }
};

// Products
export const getProducts = () => api.get('/products');
export const getProductById = (id) => api.get(`/products/${id}`);
export const createProduct = (productData) => {
  return api.post('/products', productData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};
export const updateProduct = (id, productData) => api.put(`/products/${id}`, productData);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

// Cart
export const getCart = () => api.get('/cart');
export const addToCart = (productId, quantity) => api.post('/cart/add', { productId, quantity });
export const updateCartItem = (itemId, quantity) => api.put(`/cart/${itemId}`, { quantity });
export const removeCartItem = (itemId) => api.delete(`/cart/${itemId}`);

// User profile
export const getUserProfile = () => api.get('/user/profile');
export const updateUserProfile = (userData) => api.put('/user/profile', userData);

// Orders
export const createOrder = (orderData) => api.post('/orders', orderData);
export const getOrders = () => api.get('/orders');
export const getOrderById = (id) => api.get(`/orders/${id}`);

export default api;
