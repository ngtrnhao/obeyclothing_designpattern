import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SearchBar from './SearchBar';
import styles from './style.component/Header.module.css';

const Header = () => {
  const { user, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header className={`${styles.header} ${isScrolled ? styles.headerScrolled : ''}`}>
      <div className={styles.logo}>Fashion Store</div>
      <nav className={styles.nav}>
        <ul>
          <li><Link to="/">Trang chủ</Link></li>
          <li><Link to="/products">Sản phẩm</Link></li>
          <li><Link to="/cart">Giỏ hàng</Link></li>
          {user && (
            <li>
              <Link to={user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard'}>
                Dashboard
              </Link>
            </li>
          )}
        </ul>
      </nav>
      <SearchBar />
      <div className={styles.auth}>
        {user ? (
          <>
            <span>Xin chào, {user.username}</span>
            <button onClick={logout} className={styles.logoutButton}>Đăng xuất</button>
          </>
        ) : (
          <Link to="/auth" className={styles.loginButton}>Đăng nhập</Link>
        )}
      </div>
    </header>
  );
};

export default Header;