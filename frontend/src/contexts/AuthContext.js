import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserProfile, setAuthToken } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setAuthToken(token);
    } else if (token) {
      getUserProfile().then(response => {
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
      }).catch(error => {
        console.error('Error fetching user profile:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      });
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    if (userData.token) {
      localStorage.setItem('token', userData.token);
      localStorage.setItem('user', JSON.stringify(userData));
      setAuthToken(userData.token);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuthToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => useContext(AuthContext);
