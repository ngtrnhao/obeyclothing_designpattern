import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import styles from './style.component/AdminDashboard.module.css';

const AdminDashboard = () => {
  return (
    <div className={styles.adminDashboard}>
      <h1>Trang quản trị</h1>
      <nav>
        <ul>
          <li><Link to="/admin/products">Quản lý sản phẩm</Link></li>
          <li><Link to="/admin/orders">Quản lý đơn hàng</Link></li>
          <li><Link to="/admin/users">Quản lý người dùng</Link></li>
          <li><Link to="/admin/create-product">Tạo sản phẩm mới</Link></li>
          <li><Link to="/admin/statistics">Thống kê</Link></li>
        </ul>
      </nav>
      <div className={styles.content}>
        <Outlet />
      </div>
    </div>
  );
};

export default AdminDashboard;
