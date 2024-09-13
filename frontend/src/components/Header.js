
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from './style.component/Header.module.css';

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className={styles.header}>
      <div className={styles.logo}>Fashion Store</div>
      <nav className={styles.nav}>
        <ul>
          <li><Link to="/">Trang chủ</Link></li>
          <li><Link to="/products">Sản phẩm</Link></li>
          <li><Link to="/cart">Giỏ hàng</Link></li>
          {user && user.role === 'admin' && (
            <li><Link to="/create-product">Tạo sản phẩm</Link></li>
          )}
        </ul>
      </nav>
      <div className={styles.auth}>
        {user ? (
          <>
            <span>Xin chào, {user.name}</span>
            <button onClick={logout}>Đăng xuất</button>
          </>
        ) : (
          <Link to="/auth">Đăng nhập</Link>
        )}
      </div>
    </header>
  );
};

export default Header;