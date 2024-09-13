import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header';
import styles from './MainLayout.module.css';

const MainLayout = ({ children }) => {
  const location = useLocation();

  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          {children}
        </div>
      </main>
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerContent}>
            <div className={styles.footerSection}>
              <h3>Về chúng tôi</h3>
              <p>Fashion Store - Nơi bạn tìm thấy phong cách của mình.</p>
            </div>
            <div className={styles.footerSection}>
              <h3>Liên hệ</h3>
              <p>Email: info@fashionstore.com</p>
              <p>Điện thoại: (123) 456-7890</p>
            </div>
            <div className={styles.footerSection}>
              <h3>Theo dõi chúng tôi</h3>
              {/* Thêm các liên kết mạng xã hội ở đây */}
            </div>
          </div>
          <div className={styles.copyright}>
            <p>&copy; 2023 Fashion Store. Tất cả quyền được bảo lưu.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
