import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '../services/api';
import styles from './HomePage.module.css';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchFeaturedProducts();
    fetchCategories();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await getProducts({ featured: true, limit: 4 });
      setFeaturedProducts(response.data);
    } catch (error) {
      console.error('Error fetching featured products:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await getProducts({ groupByCategory: true });
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  return (
    <div className={styles.homePage}>
      <header className={styles.header}>
        <h1>Chào mừng đến với Fashion Store</h1>
        <p>Khám phá xu hướng thời trang mới nhất</p>
      </header>
      
      <section className={styles.featuredProducts}>
        <h2>Sản phẩm nổi bật</h2>
        <div className={styles.productGrid}>
          {featuredProducts.map(product => (
            <div key={product._id} className={styles.productCard}>
              <img src={product.image} alt={product.name} />
              <h3>{product.name}</h3>
              <p>{product.price.toLocaleString('vi-VN')} đ</p>
              <Link to={`/products/${product._id}`}>Xem chi tiết</Link>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.categories}>
        <h2>Danh mục sản phẩm</h2>
        <div className={styles.categoryGrid}>
          {categories.map(category => (
            <Link key={category._id} to={`/products?category=${category.name}`} className={styles.categoryCard}>
              <h3>{category.name}</h3>
              <p>{category.count} sản phẩm</p>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.about}>
        <h2>Về chúng tôi</h2>
        <p>Fashion Store là điểm đến lý tưởng cho những người yêu thời trang. Chúng tôi cung cấp các sản phẩm chất lượng cao với giá cả hợp lý, đảm bảo bạn luôn cập nhật xu hướng mới nhất.</p>
      </section>
    </div>
  );
};

export default HomePage;
