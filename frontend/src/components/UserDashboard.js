import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import styles from './style.component/UserDashboard.module.css';

const UserDashboard = () => {
  return (
    <div className={styles.userDashboard}>
      <h1>Trang cá nhân người dùng</h1>
      <nav>
        <ul>
          <li><Link to="/user/profile">Thông tin cá nhân</Link></li>
          <li><Link to="/user/orders">Đơn hàng của tôi</Link></li>
          <li><Link to="/products">Xem sản phẩm</Link></li>
        </ul>
      </nav>
      <Outlet />
    </div>
  );
};

export default UserDashboard;