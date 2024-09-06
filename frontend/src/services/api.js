import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const register = (username, email, password) => {
  return axios.post(`${API_URL}/auth/register`, { username, email, password });
};

export const login = (email, password) => {
  return axios.post(`${API_URL}/auth/login`, { email, password });
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