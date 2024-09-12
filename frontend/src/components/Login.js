import React, { useState } from 'react';
import { login, setAuthToken } from '../services/api';
import styles from './style.component/Login.module.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [role, setRole] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await login(email, password);
      setAuthToken(response.data.token);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userRole', response.data.role);
      setRole(response.data.role);
      setMessage(`Đăng nhập thành công với vai trò: ${response.data.role}`);
      setError('');
    } catch (error) {
      setError(error.response?.data?.message || 'Đăng nhập thất bại');
      setMessage('');
    }
  };

  return (
    <div className={styles.loginContainer}>
      <h2 className={styles.loginTitle}>Đăng nhập</h2>
      {error && <p className={styles.errorMessage}>{error}</p>}
      {message && <p className={styles.successMessage}>{message}</p>}
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Email:</label>
          <input
            className={styles.input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Mật khẩu:</label>
          <input
            className={styles.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button className={styles.button} type="submit">Đăng nhập</button>
      </form>
      {role && <p className={styles.roleMessage}>Vai trò hiện tại: {role}</p>}
    </div>
  );
};

export default Login;
