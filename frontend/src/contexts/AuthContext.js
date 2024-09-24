import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserProfile, setAuthToken } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async () => {
    try {
      const response = await getUserProfile();
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
    } catch (error) {
      console.error('Error fetching user profile:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
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
