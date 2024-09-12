import React from 'react';
import styles from './style.component/Home.module.css';

const Home = () => {
  const isLoggedIn = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  return (
    <div className={styles.homeContainer}>
      <h1 className={styles.homeTitle}>Chào mừng đến với MERN Auth App</h1>
      <p className={styles.homeDescription}>
        Đây là trang chủ của ứng dụng xác thực MERN. Bạn có thể sử dụng thanh điều hướng phía trên để đăng nhập, đăng ký hoặc khám phá các tính năng khác của ứng dụng.
      </p>
      
      {isLoggedIn && (
        <div className={styles.userInfo}>
          <p>Xin chào, {userRole}!</p>
          {userRole === 'admin' && (
            <p className={styles.adminMessage}>Bạn có quyền truy cập vào bảng điều khiển quản trị.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
