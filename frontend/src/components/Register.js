import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../services/api';
import styles from './style.component/Register.module.css';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [adminSecret, setAdminSecret] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Bắt đầu đăng ký...'); // Log để kiểm tra form submit
    try {
      console.log('Gọi API đăng ký...');
      const response = await register(username, email, password, role, adminSecret);
      console.log('Đăng ký thành công:', response);
      console.log('Chuẩn bị chuyển hướng...');
      navigate('/login');
      console.log('Đã chuyển hướng');
    } catch (error) {
      console.error('Lỗi đăng ký:', error);
      setError(error.response?.data?.message || 'Đăng ký thất bại');
    }
  };

  return (
    <div className={styles.registerContainer}>
      <h2 className={styles.registerTitle}>Đăng ký</h2>
      {error && <p className={styles.errorMessage}>{error}</p>}
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