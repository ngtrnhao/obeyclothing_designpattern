import React, { useState, useEffect } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { getProducts, getProductsByCategory, getCategoryPath } from '../services/api';
import styles from './style.component/ProductList.module.css';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryPath, setCategoryPath] = useState('');
  const location = useLocation();
  const { categoryId } = useParams();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let response;
        if (categoryId) {
          const [productsResponse, pathResponse] = await Promise.all([
            getProductsByCategory(categoryId),
            getCategoryPath(categoryId)
          ]);
          response = productsResponse;
          setCategoryPath(pathResponse.data.path);
        } else {
          const searchParams = new URLSearchParams(location.search);
          const params = {
            search: searchParams.get('search'),
            minPrice: searchParams.get('minPrice'),
            maxPrice: searchParams.get('maxPrice'),
          };
          response = await getProducts(params);
        }
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [location.search, categoryId]);

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className={styles.productList}>
      {categoryPath && (
        <h2 className={styles.categoryPath}>
          {categoryPath.map((cat, index) => (
            <React.Fragment key={cat.id}>
              {index > 0 && " > "}
              <Link to={`/category/${cat.id}`}>{cat.name}</Link>
            </React.Fragment>
          ))}
        </h2>
      )}
      <h2 className={styles.productListTitle}>Danh sách sản phẩm</h2>
      {products && products.length > 0 ? (
        <div className={styles.productGrid}>
          {products.map(product => (
            <Link to={`/products/${product._id}`} key={product._id} className={styles.productCard}>
              <img 
                src={product.image ? `${process.env.REACT_APP_API_URL}/uploads/${product.image}` : '/placeholder-image.jpg'}
                alt={product.name} 
                className={styles.productImage}
                onError={(e) => {
                  console.error("Error loading image:", e.target.src);
                  e.target.onerror = null;
                  e.target.src = '/placeholder-image.jpg';
                }}
              />
              <div className={styles.productInfo}>
                <h3 className={styles.productName}>{product.name}</h3>
                <p className={styles.productPrice}>{product.price.toLocaleString('vi-VN')} đ</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p>Không có sản phẩm nào.</p>
      )}
    </div>
  );
};

export default ProductList;