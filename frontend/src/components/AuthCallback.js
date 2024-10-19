import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  useEffect(() => {
    const token = new URLSearchParams(location.search).get('token');
    if (token) {
      login({ token });
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  }, [location, login, navigate]);

  return <div>Đang xử lý đăng nhập...</div>;
};

export default AuthCallback;