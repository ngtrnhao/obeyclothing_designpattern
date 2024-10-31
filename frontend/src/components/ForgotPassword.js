import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../services/api';
import styles from './style.component/ForgotPassword.module.css';
import { FaEnvelope, FaKey, FaArrowLeft } from 'react-icons/fa';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await forgotPassword(email);
      setMessage(response.data.message);
      setError('');
    } catch (error) {
      setError(error.response?.data?.message || 'Đã xảy ra lỗi');
      setMessage('');
    }
  };

  return (
    <div className={styles.forgotPasswordPage}>
      <div className={styles.forgotPasswordContainer}>
        <div className={styles.formHeader}>
          <h1 className={styles.forgotPasswordTitle}>
            <FaKey /> Quên mật khẩu
          </h1>
          <p className={styles.forgotPasswordSubtitle}>
            Nhập email của bạn để nhận liên kết đặt lại mật khẩu
          </p>
        </div>

        {message && <div className={styles.successMessage}>{message}</div>}
        {error && <div className={styles.errorMessage}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <FaEnvelope className={styles.inputIcon} />
            <input
              type="email"
              placeholder="Nhập email của bạn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={styles.input}
            />
          </div>

          <button type="submit" className={styles.submitButton}>
            <FaKey /> Gửi yêu cầu đặt lại mật khẩu
          </button>
        </form>

        <Link to="/login" className={styles.backToLogin}>
          <FaArrowLeft /> Quay lại đăng nhập
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
