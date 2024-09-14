/* eslint-disable unicode-bom */
import axios from 'axios';

const API_URL = 'http://localhost:5001/api'; // Đảm bảo port này khớp với port của backend

// Tạo một instance của axios với cấu hình mặc định
const api = axios.create({
  baseURL: `${process.env.REACT_APP_API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Hàm để set token vào header của mọi request
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
  }
};

// Interceptor để thêm token vào header của mỗi request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Authentication
export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      setAuthToken(response.data.token);
    }
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
export const resetPassword = (token, newPassword) => {
  console.log('Resetting password with token:', token);
  return api.post(`/auth/reset-password/${token}`, { password: newPassword });
};

// Products
export const getProducts = () => api.get('/products');
export const getProductById = (id) => api.get(`/products/${id}`);
export const createProduct = (productData) => {
  const token = localStorage.getItem('token');
  console.log('Creating product with token:', token);
  return api.post('/products', productData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${token}`
    }
  });
};
export const updateProduct = (id, productData) => api.put(`/products/${id}`, productData);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

// Cart
export const getCart = async () => {
  const response = await api.get('/cart');
  return response.data;
};

export const addToCart = async (productId, quantity) => {
  const token = localStorage.getItem('token');
  console.log('Adding to cart with token:', token); // Thêm dòng này
  try {
    const response = await api.post('/cart/add', { productId, quantity }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
};

export const updateCartItem = async (productId, quantity) => {
  const response = await api.put('/cart/update', { productId, quantity });
  return response.data;
};

export const removeCartItem = async (productId) => {
  const response = await api.delete(`/cart/remove/${productId}`);
  return response.data;
};

// User profile
export const getUserProfile = () => {
  const token = localStorage.getItem('token');
  console.log('Getting user profile with token:', token);
  return api.get('/user/profile', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};

export const updateUserProfile = (userData) => api.put('/user/profile', userData);

// Orders
export const createOrder = (orderData) => api.post('/orders', orderData);
export const getOrders = () => api.get('/orders');
export const getOrderById = (id) => api.get(`/orders/${id}`);

// Thêm hàm updateOrderStatus
export const updateOrderStatus = (orderId, status) => api.put(`/orders/${orderId}/status`, { status });

export default api;
