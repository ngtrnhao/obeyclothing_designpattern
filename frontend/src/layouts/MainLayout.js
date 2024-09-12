import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './MainLayout.module.css';

const MainLayout = ({ children }) => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? styles.active : '';
  };

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.container}>
          <Link to="/" className={styles.logo}>MERN Auth</Link>
          <nav>
            <ul className={styles.navList}>
              <li><Link to="/" className={`${styles.navLink} ${isActive('/')}`}>Trang chủ</Link></li>
              <li><Link to="/login" className={`${styles.navLink} ${isActive('/login')}`}>Đăng nhập</Link></li>
              <li><Link to="/register" className={`${styles.navLink} ${isActive('/register')}`}>Đăng ký</Link></li>
              <li><Link to="/forgot-password" className={`${styles.navLink} ${isActive('/forgot-password')}`}>Quên mật khẩu</Link></li>
            </ul>
          </nav>
        </div>
      </header>
      <main className={styles.main}>
        <div className={styles.container}>
          {children}
        </div>
      </main>
      <footer className={styles.footer}>
        <div className={styles.container}>
          <p>&copy; 2023 MERN Auth App. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
