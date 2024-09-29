import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { getProducts } from '../services/api';
import styles from './HomePage.module.css';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState({});
  const { scrollYProgress } = useScroll();

  const background1Opacity = useTransform(scrollYProgress, [0, 0.33], [1, 0]);
  const background2Opacity = useTransform(scrollYProgress, [0.33, 0.66], [0, 1]);
  const background3Opacity = useTransform(scrollYProgress, [0.66, 1], [0, 1]);

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
      <motion.div className={styles.background1} style={{ opacity: background1Opacity }} />
      <motion.div className={styles.background2} style={{ opacity: background2Opacity }} />
      <motion.div className={styles.background3} style={{ opacity: background3Opacity }} />
      
      <div className={styles.content}>
        {/* Hero section */}
        <div className={styles.hero}>
          <motion.div 
            className={styles.heroContent}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1>Khám phá phong cách của bạn</h1>
            <p>Thời trang độc đáo, phản ánh cá tính riêng</p>
            <Link to="/products" className={`${styles.ctaButton} ${styles.ctaButtonHover}`}>Khám phá bộ sưu tập</Link>
          </motion.div>
        </div>

        {/* Featured products section */}
        <section className={styles.featuredProducts}>
          <h2 className={styles.sectionTitle}>Sản phẩm nổi bật</h2>
          <div className={styles.productGrid}>
            {featuredProducts.map((product, index) => (
              <motion.div 
                key={product._id} 
                className={`${styles.productCard} ${styles.productCardHover}`}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className={styles.productImageContainer}>
                  <img 
                    className={styles.productImage}
                    src={`${process.env.REACT_APP_API_URL}${product.image}`} 
                    alt={product.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/placeholder-image.jpg';
                    }}
                  />
                  <div className={styles.productOverlay}>
                    <Link to={`/products/${product._id}`} className={styles.viewDetailLink}>Xem chi tiết</Link>
                  </div>
                </div>
                <div className={styles.productInfo}>
                  <h3 className={styles.productName}>{product.name}</h3>
                  <p className={styles.productPrice}>{product.price.toLocaleString('vi-VN')} đ</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Categories section */}
        <section className={styles.categories}>
          <h2 className={styles.sectionTitle}>Danh mục sản phẩm</h2>
          <div className={styles.categoryGrid}>
            {Object.entries(categories).map(([category, products], index) => (
              <motion.div 
                key={category} 
                className={`${styles.categoryCard} ${styles.categoryCardHover}`}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <h3 className={styles.categoryTitle}>{category}</h3>
                <p className={styles.categoryCount}>{products.length} sản phẩm</p>
                <Link to={`/category/${category}`} className={styles.categoryLink}>Xem tất cả</Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Newsletter section */}
        <section className={styles.newsletter}>
          <h2>Đăng ký nhận thông tin</h2>
          <p>Cập nhật xu hướng mới nhất và ưu đãi đặc biệt</p>
          <form className={styles.newsletterForm}>
            <input type="email" placeholder="Nhập địa chỉ email của bạn" required />
            <button type="submit" className={styles.newsletterButton}>Đăng ký</button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default HomePage;