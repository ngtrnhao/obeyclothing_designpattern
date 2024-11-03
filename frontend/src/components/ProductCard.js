import React from 'react';
import { Link } from 'react-router-dom';
import styles from './style.component/ProductCard.module.css';

const ProductCard = ({ product }) => {
  const imageUrl = (img) => {
    if (!img) return '/images/placeholder-image.jpg';
    if (img.startsWith('http')) return img;
    return `${process.env.REACT_APP_API_URL}/uploads/${img}`;
  };

  return (
    <article className={styles.productCard}>
      <Link to={`/product/${product.slug}`} className={styles.productLink}>
        <div className={styles.imageWrapper}>
          <img 
            src={imageUrl(product.image)}
            alt={product.name} 
            className={styles.productImage}
          />
        </div>
        <div className={styles.productInfo}>
          <h2 className={styles.productName}>{product.name}</h2>
          <p className={styles.productPrice}>
            {product.price.toLocaleString('vi-VN')} đ
          </p>
        </div>
      </Link>
    </article>
  );
};

export default ProductCard; 