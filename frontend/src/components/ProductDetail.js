import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductById, getProducts, addToCart } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import styles from './style.component/ProductDetail.module.css';

const ProductDetail = () => {
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const { id } = useParams();
  const { user } = useAuth();

  useEffect(() => {
    const fetchProductAndRelated = async () => {
      try {
        const productResponse = await getProductById(id);
        setProduct(productResponse.data);

        // Fetch related products (same category, excluding current product)
        const relatedResponse = await getProducts({ 
          category: productResponse.data.category,
          limit: 4,
          exclude: id
        });
        setRelatedProducts(relatedResponse.data);
      } catch (err) {
        setError('Không thể tải thông tin sản phẩm');
      }
    };
    fetchProductAndRelated();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      setError('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
      return;
    }
    try {
      await addToCart(id, quantity);
      alert('Đã thêm sản phẩm vào giỏ hàng');
    } catch (err) {
      setError('Không thể thêm sản phẩm vào giỏ hàng');
    }
  };

  if (!product) return <div>Đang tải...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className={styles.productDetail}>
      <div className={styles.productMain}>
        <img src={`${process.env.REACT_APP_API_URL}${product.image}`} alt={product.name} className={styles.productImage} />
        <div className={styles.productInfo}>
          <h2>{product.name}</h2>
          <p className={styles.description}>{product.description}</p>
          <p className={styles.price}>Giá: {product.price.toLocaleString('vi-VN')} đ</p>
          <p>Danh mục: {product.category}</p>
          <p>Còn lại: {product.stock}</p>
          <div className={styles.addToCart}>
            <input 
              type="number" 
              value={quantity} 
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value)))}
              min="1"
            />
            <button onClick={handleAddToCart}>Thêm vào giỏ hàng</button>
          </div>
        </div>
      </div>

      <div className={styles.relatedProducts}>
        <h3>Sản phẩm liên quan</h3>
        <div className={styles.productGrid}>
          {relatedProducts.map(relatedProduct => (
            <div key={relatedProduct._id} className={styles.relatedProductCard}>
              <img src={`${process.env.REACT_APP_API_URL}${relatedProduct.image}`} alt={relatedProduct.name} />
              <h4>{relatedProduct.name}</h4>
              <p>{relatedProduct.price.toLocaleString('vi-VN')} đ</p>
              <Link to={`/products/${relatedProduct._id}`}>Xem chi tiết</Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
