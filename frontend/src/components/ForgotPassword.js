import React, { useState } from 'react';
import { forgotPassword } from '../services/api';
import styles from './style.component/ForgotPassword.module.css';
import { FaEnvelope, FaKey } from 'react-icons/fa';

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
    <div className={styles.forgotPasswordContainer}>
      <h2 className={styles.forgotPasswordTitle}>
        <FaKey className={styles.titleIcon} /> Quên mật khẩu
      </h2>
      {message && <p className={styles.successMessage}>{message}</p>}
      {error && <p className={styles.errorMessage}>{error}</p>}
      <form onSubmit={handleSubmit} className={styles.forgotPasswordForm}>
        <div className={styles.formGroup}>
          <label className={styles.label}>
            <FaEnvelope className={styles.inputIcon} /> Email:
          </label>
          <input
            className={styles.input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Nhập email của bạn"
          />
        </div>
        <button className={styles.button} type="submit">
          <FaKey /> Gửi yêu cầu đặt lại mật khẩu
        </button>
      </form>
      <div className={styles.links}>
        <a href="/login" className={styles.link}>Quay lại đăng nhập</a>
      </div>
    </div>
  );
};

export default ForgotPassword;
