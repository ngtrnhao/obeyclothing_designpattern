import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../services/api';
import styles from './style.component/Register.module.css';
import { FaUserPlus } from 'react-icons/fa';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!username) newErrors.username = 'Tên người dùng là bắt buộc';
    if (!email) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    if (!password) {
      newErrors.password = 'Mật khẩu là bắt buộc';
    } else if (password.length < 8) {
      newErrors.password = 'Mật khẩu phải có ít nhất 8 ký tự';
    }
    if (password !== confirmPassword) newErrors.confirmPassword = 'Mật khẩu không khớp';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length === 0) {
      try {
        await register(username, email, password);
        navigate('/login');
      } catch (error) {
        setErrors({ ...validationErrors, apiError: error.response?.data?.message || 'Đăng ký thất bại' });
      }
    } else {
      setErrors(validationErrors);
    }
  };

  return (
    <div className={styles.registerContainer}>
      <h2 className={styles.registerTitle}>
        <FaUserPlus className={styles.titleIcon} /> Đăng ký
      </h2>
      {errors.username && <p className={styles.errorMessage}>{errors.username}</p>}
      {errors.email && <p className={styles.errorMessage}>{errors.email}</p>}
      {errors.password && <p className={styles.errorMessage}>{errors.password}</p>}
      {errors.confirmPassword && <p className={styles.errorMessage}>{errors.confirmPassword}</p>}
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
          <label className={styles.label}>Xác nhận mật khẩu:</label>
          <input
            className={styles.input}
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button className={styles.button} type="submit">Đăng ký</button>
      </form>
    </div>
  );
};

export default Register;
