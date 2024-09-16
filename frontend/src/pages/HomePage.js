import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '../services/api';
import styles from './HomePage.module.css';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState({});

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
      const response = await getProducts();
      const groupedProducts = response.data.reduce((acc, product) => {
        if (!acc[product.category]) {
          acc[product.category] = [];
        }
        acc[product.category].push(product);
        return acc;
      }, {});
      setCategories(groupedProducts);
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
              <img 
                className={styles.productImage}
                src={`${process.env.REACT_APP_API_URL}${product.image}`} 
                alt={product.name}
                onError={(e) => {
                  console.error("Error loading image:", e.target.src);
                  e.target.onerror = null;
                  e.target.src = '/placeholder-image.jpg';
                }}
              />
              <div className={styles.productInfo}>
                <h3 className={styles.productName}>{product.name}</h3>
                <p className={styles.productPrice}>{product.price.toLocaleString('vi-VN')} đ</p>
                <Link to={`/products/${product._id}`} className={styles.viewDetailLink}>Xem chi tiết</Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.categories}>
        <h2>Danh mục sản phẩm</h2>
        {Object.entries(categories).map(([category, products]) => (
          <div key={category} className={styles.categorySection}>
            <h3>{category}</h3>
            <div className={styles.productGrid}>
              {products.map(product => (
                <div key={product._id} className={styles.productCard}>
                  <img 
                    className={styles.productImage}
                    src={`${process.env.REACT_APP_API_URL}${product.image}`} 
                    alt={product.name}
                    onError={(e) => {
                      console.error("Error loading image:", e.target.src);
                      e.target.onerror = null;
                      e.target.src = '/placeholder-image.jpg';
                    }}
                  />
                  <div className={styles.productInfo}>
                    <h4 className={styles.productName}>{product.name}</h4>
                    <p className={styles.productPrice}>{product.price.toLocaleString('vi-VN')} đ</p>
                    <Link to={`/products/${product._id}`} className={styles.viewDetailLink}>Xem chi tiết</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

     
    </div>
  );
};

export default HomePage;
