import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getProductById } from '../services/api';
import styles from './style.component/ProductDetail.module.css';

const ProductDetail = () => {
  const [product, setProduct] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await getProductById(id);
        setProduct(response.data);
      } catch (error) {
        console.error('Error fetching product:', error);
      }
    };
    fetchProduct();
  }, [id]);

  if (!product) return <div>Loading...</div>;

  // Sử dụng URL tuyệt đối cho hình ảnh
  const imageUrl = `${process.env.REACT_APP_API_URL}${product.image}`;

  return (
    <div className={styles.productDetail}>
      <img 
        src={imageUrl} 
        alt={product.name} 
        className={styles.productImage} 
        onError={(e) => {
          console.error('Error loading image:', e);
          e.target.src = 'path/to/fallback/image.jpg'; // Hình ảnh dự phòng
        }}
      />
      <div className={styles.productInfo}>
        <h2 className={styles.productName}>{product.name}</h2>
        <p className={styles.productPrice}>{product.price.toLocaleString('vi-VN')} đ</p>
        <p className={styles.productDescription}>{product.description}</p>
        {/* Các thông tin khác của sản phẩm */}
      </div>
    </div>
  );
};

export default ProductDetail;
