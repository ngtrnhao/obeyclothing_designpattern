import React, { useState } from 'react';
import { register } from '../services/api';
import styles from './style.component/Register.module.css';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [adminSecret, setAdminSecret] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await register(username, email, password, role, adminSecret);
      setMessage(response.data.message || 'Đăng ký thành công');
      setError('');
    } catch (error) {
      setError(error.response?.data?.message || 'Đăng ký thất bại');
      setMessage('');
    }
  };

  return (
    <div className={styles.registerContainer}>
      <h2 className={styles.registerTitle}>Đăng ký</h2>
      {error && <p className={styles.errorMessage}>{error}</p>}
      {message && <p className={styles.successMessage}>{message}</p>}
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Tên người dùng:</label>
          <input
            className={styles.input}
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
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
        <div className={styles.formGroup}>
          <label className={styles.label}>Vai trò:</label>
          <select 
            className={styles.select}
            value={role} 
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="user">Người dùng</option>
            <option value="admin">Quản trị viên</option>
          </select>
        </div>
        {role === 'admin' && (
          <div className={styles.formGroup}>
            <label className={styles.label}>Mã bí mật quản trị:</label>
            <input
              className={styles.input}
              type="password"
              value={adminSecret}
              onChange={(e) => setAdminSecret(e.target.value)}
              required
            />
          </div>
        )}
        <button className={styles.button} type="submit">Đăng ký</button>
      </form>
    </div>
  );
};

export default Register;