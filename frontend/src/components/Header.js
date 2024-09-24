import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SearchBar from './SearchBar';
import styles from './style.component/Header.module.css';
import { FaUserCircle, FaShoppingCart, FaSearch } from 'react-icons/fa';

const Header = () => {
  const { user, logout, loading } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getDashboardLink = () => {
    if (!user) return null;
    return user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard';
  };

  const toggleSearch = () => {
    setShowSearch(!showSearch);
  };

  if (loading) {
    return <div>Loading...</div>; // Or any loading indicator
  }

  return (
    <>
      <header className={`${styles.header} ${isScrolled ? styles.headerScrolled : ''}`}>
        <div className={styles.leftSection}>
          <Link to="/" className={styles.logo}>Fashion Store</Link>
          <nav className={styles.nav}>
            <ul>
              <li><NavLink to="/" end className={({ isActive }) => isActive ? styles.active : ''}>Trang chủ</NavLink></li>
              <li><NavLink to="/products" className={({ isActive }) => isActive ? styles.active : ''}>Sản phẩm</NavLink></li>
            </ul>
          </nav>
        </div>
        <div className={styles.rightSection}>
          <button onClick={toggleSearch} className={styles.iconButton}>
            <FaSearch />
          </button>
          <Link to="/cart" className={styles.iconLink}>
            <FaShoppingCart />
          </Link>
          {user && (
            <Link to={getDashboardLink()} className={styles.iconLink}>
              <FaUserCircle />
            </Link>
          )}
          <div className={styles.auth}>
            {user ? (
              <>
                <span>Xin chào, {user?.username || user.email || 'Người dùng'}</span>
                <button onClick={logout} className={styles.logoutButton}>Đăng xuất</button>
              </>
            ) : (
              <Link to="/auth" className={styles.loginButton}>Đăng nhập</Link>
            )}
          </div>
        </div>
      </header>
      {showSearch && (
        <div className={styles.searchOverlay}>
          <div className={styles.searchWrapper}>
            <SearchBar onClose={toggleSearch} />
          </div>
        </div>
      )}
    </>
  );
};

export default Header;