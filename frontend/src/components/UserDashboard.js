import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import styles from './style.component/UserDashboard.module.css';

const UserDashboard = () => {
  const location = useLocation();

  return (
    <div className={styles.userDashboard}>
      <h1>Trang cá nhân người dùng</h1>
      <div className={styles.dashboardContent}>
        <nav className={styles.dashboardNav}>
          <Link 
            to="/user/profile" 
            className={`${styles.navButton} ${location.pathname === '/user/profile' ? styles.active : ''}`}
          >
            Thông tin cá nhân
          </Link>
          <Link 
            to="/user/orders" 
            className={`${styles.navButton} ${location.pathname.startsWith('/user/orders') ? styles.active : ''}`}
          >
            Đơn hàng của tôi
          </Link>
          <Link 
            to="/products" 
            className={styles.navButton}
          >
            Xem sản phẩm
          </Link>
        </nav>
        <div className={styles.dashboardOutlet}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
