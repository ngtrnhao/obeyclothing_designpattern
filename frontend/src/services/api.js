/* eslint-disable unicode-bom */
import axios from 'axios';

// Thay thế dòng const API_URL = ... bằng:
const API_URL = process.env.REACT_APP_API_URL || 'https://mern-auth-eight-sage.vercel.app';

// Tạo một instance của axios với cấu hình mặc định
const api = axios.create({
  baseURL: API_URL.endsWith('/') ? `${API_URL}api` : `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Chỉ giữ một interceptor request
api.interceptors.request.use(
  (config) => {
    const publicEndpoints = ['/products', '/categories', '/products/category', '/chat'];
    if (publicEndpoints.some(endpoint => config.url.includes(endpoint))) {
      return config;
    }
    
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

// Thêm interceptor response để xử lý lỗi authentication
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Add error interceptor
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

// Danh sách c c endpoint không cần xác thực

const publicEndpoints = ['/products', '/categories', '/products/category', '/chat'];

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

// Authentication
export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
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

export const loginWithGoogle = async () => {
  window.location.href = `${API_URL}/auth/google`;
};

export const loginWithFacebook = async () => {
  try {
    const response = await api.get('/auth/facebook');
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setAuthToken(response.data.token);
    }
    return response;
  } catch (error) {
    console.error('API Facebook login error:', error.response?.data || error.message);
    throw error;
  }
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
export const createOrder = async (cartItems, shippingInfo, totalAmount) => {
  try {
    const formattedCartItems = cartItems.map(item => ({
      product: item.product._id,
      quantity: item.quantity,
      size: item.size,
      color: item.color
    }));

    console.log('Sending order data:', { cartItems: formattedCartItems, shippingInfo, totalAmount });

    // Đảm bảo shippingInfo bao gồm streetAddress
    const formattedShippingInfo = {
      ...shippingInfo,
      streetAddress: shippingInfo.streetAddress || shippingInfo.address
    };

    const response = await api.post('/orders', {
      cartItems: formattedCartItems,
      shippingInfo: formattedShippingInfo,
      totalAmount
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

export const toggleAdminUserStatus = async (userId, isActive) => {
  try {
    const response = await api.patch(`/admin/users/${userId}/toggle-status`, { isActive });
    return response;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Lỗi khi thay đổi trạng thái người dùng';
    const customError = new Error(errorMessage);
    customError.response = {
      data: {
        message: errorMessage
      }
    };
    throw customError;
  }
};

export const getAdminStatistics = async (startDate, endDate, period) => {
  const token = localStorage.getItem('token');
  try {
    const response = await api.get('/admin/statistics', {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      params: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        period
      }
    });
    return response.data;
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
  console.log('completePaypalOrder called with data:', orderData);
  const response = await api.post('/orders/complete-paypal-order', orderData);
  console.log('completePaypalOrder response:', response.data);
  return response.data;
};

export const getDeliveries = () => api.get('/admin/deliveries');

export const updateDeliveryStatus = (deliveryId, status) => api.put(`/admin/deliveries/${deliveryId}`, { status });

export const getProvinces = async () => {
  try {
    const response = await api.get('/address/provinces');
    console.log('Provinces data:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching provinces:', error);
    throw error;
  }
};

export const getDistricts = async (provinceId) => {
  try {
    const response = await api.get(`/address/districts/${provinceId}`);
    console.log('Districts data:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching districts:', error);
    throw error;
  }
};

export const getWards = async (districtId) => {
  try {
    const response = await api.get(`/address/wards/${districtId}`);
    console.log('Wards data:', response.data);
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

export const updateUserInfo = async (userInfo) => {
  console.log('Sending user info to server:', userInfo);
  try {
    const response = await api.put('/user/profile', userInfo);
    return response.data;
  } catch (error) {
    console.error('Error updating user info:', error.response?.data || error.message);
    throw error;
  }
};

export const fetchCart = () => api.get('/cart');

export const getProductBySlug = async (slug) => {
  try {
    const response = await api.get(`/products/slug/${slug}`);
    return response.data;
  } catch (error) {
    console.error('Error in getProductBySlug:', error);
    throw error;
  }
};



export const updateStock = (productId, newStock) => api.put('/admin/products/update-stock', { productId, quantity: newStock });
export const getLowStockProducts = () => api.get('/admin/products/low-stock');

export const getPurchaseOrders = () => api.get('/admin/purchase-orders');
export const updatePurchaseOrder = (id, data) => api.put(`/admin/purchase-orders/${id}`, data);
export const createPurchaseOrder = async (orderData) => {
  try {
    const response = await api.post('/admin/purchase-orders', orderData);
    return response.data;
  } catch (error) {
    console.error('Error creating purchase order:', error);
    throw error;
  }
};

export const getSuppliers = () => api.get('/suppliers');
export const createSupplier = (data) => api.post('/suppliers', data);
export const updateSupplier = (id, data) => api.put(`/suppliers/${id}`, data);
export const deleteSupplier = (id) => api.delete(`/suppliers/${id}`);

export const confirmReceiptAndUpdateInventory = (orderId, actualQuantity) => 
  api.put(`/admin/purchase-orders/${orderId}/confirm-receipt`, { actualQuantity });

export const getOrderDetails = async (orderId) => {
  const response = await axios.get(`/api/orders/${orderId}`);
  return response.data;
};

export const downloadInvoice = async (orderId) => {
  try {
    const response = await api.get(`/orders/invoice/${orderId}`, {
      responseType: 'blob'
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `invoice-${orderId}.pdf`);
    document.body.appendChild(link);
    link.click();
  } catch (error) {
    console.error('Error downloading invoice:', error);
    throw error;
  }
};

export const getShippingAddresses = () => api.get('/user/shipping-addresses');
export const addShippingAddress = (address) => api.post('/user/shipping-addresses', address);
export const updateShippingAddress = (id, address) => api.put(`/user/shipping-addresses/${id}`, address);
export const deleteShippingAddress = (id) => api.delete(`/user/shipping-addresses/${id}`);
export const setDefaultShippingAddress = (id) => api.put(`/user/shipping-addresses/${id}/set-default`);

export const changeUserRole = async (userId, role) => {
  try {
    const response = await api.put(`/admin/users/${userId}/role`, { role });
    return response.data;
  } catch (error) {
    console.error('API change user role error:', error.response?.data || error.message);
    throw error;
  }
};

export const toggleUserStatus = async (userId) => {
  try {
    const response = await api.patch(`/admin/users/${userId}/toggle-status`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Có lỗi xảy ra khi thay đổi trạng thái người dùng' };
  }
};

export const cancelOrder = async (orderId) => {
  try {
    const response = await api.put(`/orders/${orderId}/cancel`);
    return response.data;
  } catch (error) {
    console.error('Error cancelling order:', error);
    throw error;
  }
};

export default api;

