import React, { useState } from 'react';
import Login from '../components/Login';
import Register from '../components/Register';
import ForgotPassword from '../components/ForgotPassword';
import styles from './AuthPage.module.css';

const AuthPage = () => {
  const [activeTab, setActiveTab] = useState('login');

  return (
    <div className={styles.authPage}>
      <div className={styles.tabContainer}>
        <button
          className={`${styles.tabButton} ${activeTab === 'login' ? styles.active : ''}`}
          onClick={() => setActiveTab('login')}
        >
          <i className="fas fa-sign-in-alt"></i> Đăng nhập
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'register' ? styles.active : ''}`}
          onClick={() => setActiveTab('register')}
        >
          <i className="fas fa-user-plus"></i> Đăng ký
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'forgotPassword' ? styles.active : ''}`}
          onClick={() => setActiveTab('forgotPassword')}
        >
          <i className="fas fa-key"></i> Quên mật khẩu
        </button>
      </div>
      <div className={styles.authContent}>
        {activeTab === 'login' && <Login />}
        {activeTab === 'register' && <Register />}
        {activeTab === 'forgotPassword' && <ForgotPassword />}
      </div>
    </div>
  );
};

export default AuthPage;
