import React from 'react';
import { Link } from 'react-router-dom';
import styles from './style.component/Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerSection}>
          <h3>OBEY CLOTHING</h3>
          <Link to="/shipping">SHIPPING</Link>
          <Link to="/returns">RETURNS</Link>
        </div>
        <div className={styles.footerSection}>
          <Link to="/gift-cards">GIFT CARDS</Link>
          <Link to="/stockists">STOCKISTS</Link>
          <Link to="/contact">CONTACT</Link>
        </div>
        <div className={styles.footerSection}>
          <Link to="/brand-protection">BRAND PROTECTION</Link>
          <Link to="/help">HELP</Link>
          <Link to="/newsletter">NEWSLETTER</Link>
        </div>
        <div className={styles.footerSection}>
          <div className={styles.socialLinks}>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <img src="/assets/instagram-icon.png" alt="Instagram" />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <img src="/assets/facebook-icon.png" alt="Facebook" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <img src="/assets/twitter-icon.png" alt="Twitter" />
            </a>
          </div>
          <div className={styles.copyright}>
            <img src="/assets/obey-icon.png" alt="OBEY icon" />
            <span>© OBEY CLOTHING</span>
          </div>
        </div>
      </div>
      <div className={styles.footerBottom}>
        <Link to="/terms">TERMS OF SERVICE</Link>
        <Link to="/privacy">PRIVACY POLICY</Link>
      </div>
    </footer>
  );
};

export default Footer;