import React from 'react';
import { Link } from 'react-router-dom';
import styles from './style.component/Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerColumn}>
          <h3>OBEY CLOTHING VIỆT NAM</h3>
          <Link to="/chinh-sach-giao-hang">Chính sách giao hàng</Link>
          <Link to="/chinh-sach-doi-tra">Chính sách đổi trả</Link>
          <Link to="/the-qua-tang">Thẻ quà tặng OBEY</Link>
        </div>
        <div className={styles.footerColumn}>
          <h3>THÔNG TIN CỬA HÀNG</h3>
          <Link to="/he-thong-cua-hang">Hệ thống cửa hàng</Link>
          <Link to="/lien-he">Liên hệ</Link>
          <Link to="/bao-ve-thuong-hieu">Bảo vệ thương hiệu</Link>
        </div>
        <div className={styles.footerColumn}>
          <h3>HỖ TRỢ KHÁCH HÀNG</h3>
          <Link to="/ho-tro-khach-hang">Trung tâm hỗ trợ</Link>
          <Link to="/dang-ky-nhan-tin">Đăng ký nhận tin mới nhất</Link>
        </div>
        <div className={styles.footerColumn}>
          <h3>KẾT NỐI VỚI CHÚNG TÔI</h3>
          <div className={styles.socialLinks}>
            <a href="https://instagram.com/obeyclothing_vietnam" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="https://facebook.com/obeyclothing.vietnam" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="https://twitter.com/obey_vietnam" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-twitter"></i>
            </a>
          </div>
        </div>
      </div>
      <div className={styles.footerSeparator}></div>
      <div className={styles.footerBottom}>
        <div className={styles.copyright}>
          <img src="/assets/obey-logo.png" alt="OBEY Logo" className={styles.footerLogo} />
          <span>© 2023 OBEY CLOTHING VIỆT NAM</span>
        </div>
        <div className={styles.legalLinks}>
          <Link to="/dieu-khoan-dich-vu">Điều khoản dịch vụ</Link>
          <Link to="/chinh-sach-bao-mat">Chính sách bảo mật</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;