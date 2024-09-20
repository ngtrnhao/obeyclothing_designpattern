import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Login from '../components/Login';
import Register from '../components/Register';
import ForgotPassword from '../components/ForgotPassword';
import styles from './AuthPage.module.css';

const AuthPage = () => {
  const [activeTab, setActiveTab] = useState('login');

  const tabVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'login':
        return <Login />;
      case 'register':
        return <Register />;
      case 'forgotPassword':
        return <ForgotPassword />;
      default:
        return null;
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authContainer}>
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
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3 }}
            className={styles.authContent}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AuthPage;
