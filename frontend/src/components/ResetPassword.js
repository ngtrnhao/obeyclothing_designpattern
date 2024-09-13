import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../services/api';
import styles from './style.component/ResetPassword.module.css';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Token from URL:', token);
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Mật khẩu không khớp');
      return;
    }
    try {
      console.log('Submitting reset password with token:', token);
      const response = await resetPassword(token, password);
      console.log('Reset password response:', response);
      setMessage(response.data.message);
      setError('');
      setTimeout(() => navigate('/auth'), 3000);
    } catch (error) {
      console.error('Reset password error:', error);
      if (error.response) {
        setError(error.response.data.message || 'Đã xảy ra lỗi khi đặt lại mật khẩu');
      } else if (error.request) {
        setError('Không thể kết nối đến server. Vui lòng thử lại sau.');
      } else {
        setError('Đã xảy ra lỗi. Vui lòng thử lại.');
      }
      setMessage('');
    }
  };

  return (
    <div className={styles.resetPasswordContainer}>
      <h2 className={styles.resetPasswordTitle}>Đặt lại mật khẩu</h2>
      {message && <p className={styles.successMessage}>{message}</p>}
      {error && <p className={styles.errorMessage}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Mật khẩu mới:</label>
          <input
            className={styles.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Xác nhận mật khẩu:</label>
          <input
            className={styles.input}
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button className={styles.button} type="submit">Đặt lại mật khẩu</button>
      </form>
    </div>
  );
};

export default ResetPassword;
