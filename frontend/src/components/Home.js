import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '../services/api';
import styles from './style.component/Home.module.css';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const isLoggedIn = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await getProducts();
      setProducts(response.data);
      const uniqueCategories = [...new Set(response.data.map(product => product.category))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  return (
    <div className={styles.homeContainer}>
      <h1 className={styles.homeTitle}>Chào mừng đến với Fashion Store</h1>
      
      <div className={styles.featuredCategories}>
        <h2>Danh mục sản phẩm</h2>
        <div className={styles.categoryGrid}>
          {categories.map((category, index) => (
            <Link key={index} to={`/products?category=${category}`} className={styles.categoryCard}>
              <span className={styles.categoryName}>{category}</span>
            </Link>
          ))}
        </div>
      </div>
      
      <div className={styles.featuredProducts}>
        <h2>Sản phẩm nổi bật</h2>
        <div className={styles.productGrid}>
          {products.slice(0, 4).map(product => (
            <div key={product._id} className={styles.productCard}>
              <img src={product.image} alt={product.name} className={styles.productImage} />
              <h3>{product.name}</h3>
              <p>{product.price.toLocaleString('vi-VN')} đ</p>
              <Link to={`/products/${product._id}`} className={styles.viewProductButton}>
                Xem chi tiết
              </Link>
            </div>
          ))}
        </div>
      </div>
      
      {isLoggedIn && userRole === 'admin' && (
        <div className={styles.adminActions}>
          <Link to="/create-product" className={styles.createProductButton}>
            Tạo sản phẩm mới
          </Link>
        </div>
      )}
    </div>
  );
};

export default Home;
