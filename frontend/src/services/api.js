/* eslint-disable unicode-bom */
import axios from 'axios';

const API_URL = 'http://localhost:5001/api'; // Đảm bảo port này khớp với port của backend

// Tạo một instance của axios với cấu hình mặc định
const api = axios.create({
  baseURL: `${process.env.REACT_APP_API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});


// Danh sách các endpoint không cần xác thực
const publicEndpoints = ['/products', '/categories', '/products/category'];

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
    // Chỉ thêm token nếu endpoint không nằm trong danh sách public
    if (token && !publicEndpoints.some(endpoint => config.url.includes(endpoint))) {
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
      localStorage.setItem('user', JSON.stringify(response.data.user));
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
export const getProducts = async (params = {}) => {
  try {
    const response = await api.get('/products', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const getProductById = async (id) => {
  try {
    const response = await api.get(`/products/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching product by id:', error);
    throw error;
  }
};

export const createProduct = async (productData) => {
  try {
    const response = await api.post('/products', productData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating product:', error.response?.data || error.message);
    throw error;
  }
};
export const updateProduct = (id, productData) => api.put(`/products/${id}`, productData);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

// Cart
export const getCart = async () => {
  try {
    const response = await api.get('/cart');
    return response.data;
  } catch (error) {
    console.error('Error fetching cart:', error);
    throw error;
  }
};

export const addToCart = async (cartItem) => {
  try {
    const response = await api.post('/cart/add', cartItem);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const removeFromCart = (productId) => api.delete(`/cart/remove/${productId}`);

export const updateCartItemQuantity = async (productId, quantity) => {
  try {
    const response = await api.put(`/cart/update/${productId}`, { quantity });
    return response.data;
  } catch (error) {
    console.error('Error updating cart item quantity:', error);
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
export const getUserProfile = () => api.get('/user/profile');
export const updateUserProfile = (profileData) => api.put('/user/profile', profileData);
export const getUserOrders = () => api.get('/user/orders');

// Orders
export const createOrder = async (paypalOrder) => {
  try {
    const token = localStorage.getItem('token');
    const response = await api.post('/orders', { paypalOrder }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const getOrders = () => api.get('/orders');
export const getOrderById = (id) => api.get(`/orders/${id}`);

// Thêm hàm updateOrderStatus
export const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await api.put(`/admin/orders/${orderId}`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

// Thêm hàm getCategories
export const getCategories = async () => {
  try {
    const response = await api.get('/categories');
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

export const deleteCategory = async (category) => {
  try {
    const token = localStorage.getItem('token');
    const encodedCategory = encodeURIComponent(category);
    const response = await api.delete(`/categories/${encodedCategory}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};

// Admin Dashboard APIs
export const getAdminProducts = () => api.get('/admin/products');

export const updateAdminProduct = (id, productData) => {
  const token = localStorage.getItem('token');
  return api.put(`/admin/products/${id}`, productData, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};

export const deleteAdminProduct = (id) => {
  const token = localStorage.getItem('token');
  return api.delete(`/admin/products/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};

export const getAdminOrders = () => {
  const token = localStorage.getItem('token');
  return api.get('/admin/orders', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};

export const updateAdminOrderStatus = (orderId, status) => api.put(`/admin/orders/${orderId}`, { status });

export const getAdminUsers = () => {
  const token = localStorage.getItem('token');
  return api.get('/admin/users', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};

export const toggleAdminUserStatus = (userId, isActive) => {
  const token = localStorage.getItem('token');
  return api.put(`/admin/users/${userId}`, { isActive }, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};

export const getAdminStatistics = async () => {
  const token = localStorage.getItem('token');
  try {
    const response = await api.get('/admin/statistics', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data; // Trả về response.data thay vì ton b response
  } catch (error) {
    console.error('Error fetching admin statistics:', error.response?.data || error.message);
    throw error;
  }
};

// ... existing functions ...

export const getProductReviews = async (productId) => {
  try {
    const response = await api.get(`/products/${productId}/reviews`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const addProductReview = async (productId, reviewData) => {
  try {
    const response = await api.post(`/products/${productId}/reviews`, reviewData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createCategory = async (categoryData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await api.post('/categories', categoryData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating category:', error.response?.data || error.message);
    throw error;
  }
};

export const getProductsByCategory = async (categoryId) => {
  try {
    const response = await api.get(`/products/category/${categoryId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching products by category:', error);
    throw error;
  }
};

export const getCategoryPath = async (categoryId) => {
  try {
    const response = await api.get(`/categories/${categoryId}/path`);
    return response.data;
  } catch (error) {
    console.error('Error getting category path:', error);
    throw error;
  }
};

export const getSubcategories = async (categoryId) => {
  try {
    const response = await api.get(`/categories/${categoryId}/subcategories`);
    return response.data;
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    throw error;
  }
};

export const getCategoryBySlugOrId = async (slugOrId) => {
  try {
    const response = await api.get(`/categories/find/${slugOrId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching category:', error);
    throw error;
  }
};

export const getProductsByCategorySlug = async (slug) => {
  try {
    const response = await api.get(`/categories/${slug}/products`);
    console.log('API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching products by category:', error);
    throw error;
  }
};

export const getAllProducts = async () => {
  try {
    const response = await axios.get(`${API_URL}/products`);
    return response.data;
  } catch (error) {
    console.error('Error fetching all products:', error);
    throw error;
  }
};

export const getProductsByCategoryAndChildren = async (categoryId) => {
  try {
    const response = await axios.get(`${API_URL}/api/categories/${categoryId}/products-recursive`);
    return response.data;
  } catch (error) {
    console.error('Error fetching products by category and children:', error);
    throw error;
  }
};

export const createPaypalOrder = async () => {
  try {
    const response = await api.post('/orders/create-paypal-order');
    return response.data;
  } catch (error) {
    console.error('Error creating PayPal order:', error);
    throw error;
  }
};

export const completePaypalOrder = async (orderData) => {
  try {
    const response = await api.post('/orders/complete-paypal-order', orderData);
    return response.data;
  } catch (error) {
    console.error('Error completing PayPal order:', error);
    throw error;
  }
};

export const getDeliveries = () => api.get('/deliveries');
export const updateDeliveryStatus = (deliveryId, status) => api.put(`/deliveries/${deliveryId}`, { status });

export const getProvinces = async () => {
  try {
    const response = await api.get('/address/provinces');
    return response.data;
  } catch (error) {
    console.error('Error fetching provinces:', error);
    throw error;
  }
};

export const getDistricts = async (provinceId) => {
  try {
    const response = await api.get(`/address/districts/${provinceId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching districts:', error);
    throw error;
  }
};

export const getWards = async (districtId) => {
  try {
    const response = await api.get(`/address/wards/${districtId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching wards:', error);
    throw error;
  }
};

export const getUserInfo = async () => {
  try {
    const response = await api.get('/user/profile');
    return response.data;
  } catch (error) {
    console.error('Error fetching user info:', error);
    throw error;
  }
};

export const updateUserInfo = (userInfo) => api.put('/user/profile', userInfo);

export const fetchCart = () => api.get('/cart');

export default api;