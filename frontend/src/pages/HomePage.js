import React from 'react';
import { Link } from 'react-router-dom';
import styles from './HomePage.module.css';

const HomePage = () => {
  return (
    <div className={styles.homePage}>
      <header className={styles.header}>
        <h1>Chào mừng đến với Fashion Store</h1>
        <p>Khám phá xu hướng thời trang mới nhất</p>
      </header>
          
      <section className={styles.featuredProducts}>
        <h2>Sản phẩm nổi bật</h2>
        {/* Thêm danh sách sản phẩm nổi bật ở đây */}
      </section>

      <section className={styles.categories}>
        <h2>Danh mục sản phẩm</h2>
        {/* Thêm danh sách danh mục sản phẩm ở đây */}
      </section>

      <section className={styles.about}>
        <h2>Về chúng tôi</h2>
        <p>Fashion Store là điểm đến lý tưởng cho những người yêu thời trang...</p>
      </section>

     
    </div>
  );
};

export default HomePage;
