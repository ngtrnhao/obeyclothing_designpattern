import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

export const register = (username, email, password, role = 'user', adminSecret = '') => {
  return axios.post(`${API_URL}/auth/register`, { username, email, password, role, adminSecret });
};

export const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password });
    console.log('API login response:', response.data);
    return response;
  } catch (error) {
    console.error('API login error:', error);
    throw error;
  }
};

export const forgotPassword = (email) => {
  return axios.post(`${API_URL}/auth/forgot-password`, { email });
};

export const resetPassword = (token, newPassword) => {
  return axios.post(`${API_URL}/auth/reset-password`, { token, newPassword });
};

export const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};