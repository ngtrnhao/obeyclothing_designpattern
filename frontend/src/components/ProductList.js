import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '../services/api';
import styles from './style.component/ProductList.module.css';

const ProductList = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getProducts();
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className={styles.productList}>
      {products.map(product => (
        <div key={product._id} className={styles.productCard}>
          <img 
            src={`http://localhost:5001${product.image}`} 
            alt={product.name} 
            className={styles.productImage} 
          />
          <div className={styles.productInfo}>
            <h3 className={styles.productName}>{product.name}</h3>
            <p className={styles.productPrice}>{product.price.toLocaleString('vi-VN')} đ</p>
            <Link to={`/products/${product._id}`} className={styles.addToCartButton}>
              Xem chi tiết
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductList;
