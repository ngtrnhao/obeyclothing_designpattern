import React from 'react';
import { Link } from 'react-router-dom';
import styles from './HomePage.module.css';

const HomePage = () => {
  return (
    <div className={styles.homePage}>
      <div className={styles.heroSection}>
        <img src="/assets/men.jpg" alt="Men's Collection" className={styles.heroImage} />
        <img src="/assets/women.jpg" alt="Women's Collection" className={styles.heroImage} />
      </div>
      <div className={styles.categoryLinks}>
        <Link to="/products/men" className={styles.categoryLink}>Men</Link>
        <Link to="/products/women" className={styles.categoryLink}>Women</Link>
      </div>
    </div>
  );
};

export default HomePage;
