import React, { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login as apiLogin, loginWithGoogle, loginWithFacebook } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import styles from './style.component/Login.module.css';
import { FaEnvelope, FaLock, FaSignInAlt, FaUserPlus, FaKey, FaGoogle, FaFacebook } from 'react-icons/fa';
import { toast } from 'react-toastify';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await apiLogin(email, password);
      if (response.status === 'locked' || response.status === 'temporary_locked') {
        toast.error(response.message, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        return;
      }
      if (response.data.token) {
        const userData = {
          ...response.data.user,
          token: response.data.token
        };
        await login(userData);
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đăng nhập thất bại');
    }
  };

  const handleGoogleLogin = useCallback(async () => {
    try {
      const response = await loginWithGoogle();
      if (response.data.token) {
        const userData = {
          ...response.data.user,
          token: response.data.token
        };
        await login(userData);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập bằng Google thất bại');
    }
  }, [login, navigate]);

  const handleFacebookLogin = useCallback(async () => {
    try {
      const response = await loginWithFacebook();
      if (response.data.token) {
        const userData = {
          ...response.data.user,
          token: response.data.token
        };
        await login(userData);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập bằng Facebook thất bại');
    }
  }, [login, navigate]);

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginContainer}>
        <div className={styles.loginImage}>
          {/* Hình ảnh thời trang sẽ được đặt ở đây */}
        </div>
        <div className={styles.loginForm}>
          <h1 className={styles.loginTitle}>Đăng nhập</h1>
          <p className={styles.loginSubtitle}>Chào mừng bạn đến với thế giới thời trang của chúng tôi</p>
          {error && <div className={styles.errorMessage}>{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
              <FaEnvelope className={styles.inputIcon} />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={styles.input}
              />
            </div>
            <div className={styles.inputGroup}>
              <FaLock className={styles.inputIcon} />
              <input
                type="password"
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={styles.input}
              />
            </div>
            <button type="submit" className={styles.loginButton}>
              <FaSignInAlt className={styles.buttonIcon} /> Đăng nhập
            </button>
          </form>
          <div className={styles.socialLogin}>
            <button onClick={handleGoogleLogin} className={`${styles.socialButton} ${styles.googleButton}`}>
              <FaGoogle className={styles.buttonIcon} /> Đăng nhập bằng Google
            </button>
            <button onClick={handleFacebookLogin} className={`${styles.socialButton} ${styles.facebookButton}`}>
              <FaFacebook className={styles.buttonIcon} /> Đăng nhập bằng Facebook
            </button>
          </div>
          <div className={styles.loginFooter}>
            <Link to="/forgot-password" className={styles.footerLink}>
              <FaKey className={styles.linkIcon} /> Quên mật khẩu?
            </Link>
            <Link to="/register" className={styles.footerLink}>
              <FaUserPlus className={styles.linkIcon} /> Tạo tài khoản mới
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
