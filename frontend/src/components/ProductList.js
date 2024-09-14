import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getProducts } from '../services/api';
import styles from './style.component/ProductList.module.css';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const category = searchParams.get('category');
    fetchProducts(category);
  }, [location]);

  const fetchProducts = async (category) => {
    try {
      setLoading(true);
      const response = await getProducts({ category });
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className={styles.productList}>
      <h2>Danh sách sản phẩm</h2>
      <div className={styles.productGrid}>
        {products.map(product => (
          <div key={product._id} className={styles.productCard}>
            <img 
              src={`${process.env.REACT_APP_API_URL}${product.image}`}
              alt={product.name} 
              className={styles.productImage}
              onError={(e) => {
                console.error("Error loading image:", e.target.src);
                e.target.onerror = null; // Prevent infinite loop
                e.target.src = '/path/to/placeholder-image.jpg'; // Đường dẫn đến hình ảnh placeholder
              }}
            />
            <div className={styles.productInfo}>
              <h3 className={styles.productName}>{product.name}</h3>
              <p className={styles.productPrice}>{product.price.toLocaleString('vi-VN')} đ</p>
              <Link to={`/products/${product._id}`} className={styles.viewProductButton}>
                Xem chi tiết
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;
