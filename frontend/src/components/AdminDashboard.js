import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { FaChartLine, FaShoppingCart, FaUsers, FaBox, FaPlus, FaTags, FaUser, FaWarehouse, FaFileInvoiceDollar, FaUserTie } from 'react-icons/fa';
import styles from './style.component/AdminDashboard.module.css';


const AdminDashboard = () => {
  const location = useLocation();

  const navItems = [
    { path: '/admin/statistics', icon: <FaChartLine />, text: 'Thống kê' },
    { path: '/admin/products', icon: <FaBox />, text: 'Quản lý sản phẩm' },
    { path: '/admin/categories', icon: <FaTags />, text: 'Quản lý danh mục' },
    { path: '/admin/orders', icon: <FaShoppingCart />, text: 'Quản lý đơn hàng' },
    { path: '/admin/users', icon: <FaUsers />, text: 'Quản lý người dùng' },
    { path: '/admin/create-product', icon: <FaPlus />, text: 'Tạo sản phẩm mới' },
    { path: '/admin/profile', icon: <FaUser />, text: 'Thông tin cá nhân' },
    { path: '/admin/inventory', icon: <FaWarehouse />, text: 'Quản lý kho hàng' },
    { path: '/admin/purchase-orders', icon: <FaFileInvoiceDollar />, text: 'Quản lý đơn đặt hàng' },
    { path: '/admin/suppliers', icon: <FaUserTie />, text: 'Quản lý nhà cung cấp' },
  ];

  return (
    <div className={styles.adminDashboard}>
      <aside className={styles.sidebar}>
        <h1 className={styles.dashboardTitle}>Trang quản trị</h1>
        <nav className={styles.dashboardNav}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`${styles.navButton} ${location.pathname === item.path ? styles.active : ''}`}
            >
              {item.icon}
              <span>{item.text}</span>
            </Link>
          ))}
        </nav>
      </aside>
      <main className={styles.mainContent}>
        <header className={styles.header}>
          <h2>Xin chào, Quản trị viên</h2>
          <div className={styles.userMenu}>
            {/* Thêm các mục menu người dùng nếu cần */}
          </div>
        </header>
        <div className={styles.dashboardOutlet}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;