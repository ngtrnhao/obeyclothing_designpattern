import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserProfile, setAuthToken } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }
      
      const response = await getUserProfile();
      if (!response.data) {
        throw new Error('No user data received');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      throw new Error('Unauthorized');
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        setAuthToken(token);
        await fetchUserProfile();
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (userData) => {
    setUser(userData);
    if (userData.token) {
      localStorage.setItem('token', userData.token);
      localStorage.setItem('user', JSON.stringify(userData));
      setAuthToken(userData.token);
      await fetchUserProfile(); // Fetch user profile after login
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuthToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
