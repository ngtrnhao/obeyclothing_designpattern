import React, { useState, useEffect, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getCategories, getProductsByCategorySlug, getAllProducts } from '../services/api';
import styles from './style.component/ProductList.module.css';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { slug } = useParams();

  const imageUrl = (img) => {
    if (!img) return '/images/placeholder-image.jpg';
    if (img.startsWith('http')) return img;
    const cleanedPath = img.replace(/^uploads\\/, '');
    return `${process.env.REACT_APP_API_URL}/uploads/${cleanedPath}`;
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const categoriesData = await getCategories();
      setCategories(categoriesData);

      if (slug) {
        const category = categoriesData.find(cat => cat.slug === slug);
        setCurrentCategory(category || null);
        const productsData = await getProductsByCategorySlug(slug);
        setProducts(productsData);
      } else {
        setCurrentCategory(null);
        const allProductsData = await getAllProducts();
        setProducts(allProductsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const renderCategories = (categories, level = 0) => {
    return categories.map(category => (
      <React.Fragment key={category._id}>
        <li style={{ marginLeft: `${level * 20}px` }}>
          <Link to={`/category/${category.slug}`}>{category.name}</Link>
        </li>
        {category.children && renderCategories(category.children, level + 1)}
      </React.Fragment>
    ));
  };

  if (loading) return <div className={styles.loading}>Đang tải...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.productList}>
      <div className={styles.sidebar}>
        <h3>Danh mục</h3>
        <ul>{renderCategories(categories)}</ul>
      </div>
      <div className={styles.productGrid}>
        <h2>{currentCategory ? currentCategory.name : 'Tất cả sản phẩm'}</h2>
        {products.length > 0 ? (
          products.map(product => (
            <div key={product._id} className={styles.productCard}>
              <img 
                src={imageUrl(product.image)}
                alt={product.name} 
                className={styles.productImage}
                onError={(e) => {
                  console.error("Error loading image:", e.target.src);
                  e.target.onerror = null;
                  e.target.src = '/images/placeholder-image.jpg';
                }}
              />
              <div className={styles.productInfo}>
                <h3>{product.name}</h3>
                <p className={styles.productPrice}>{product.price.toLocaleString('vi-VN')} đ</p>
                <Link to={`/product/${product.slug}`} className={styles.productLink}>
                  Xem chi tiết
                </Link>
              </div>
            </div>
          ))
        ) : (
          <p>Không có sản phẩm nào trong danh mục này.</p>
        )}
      </div>
    </div>
  );
};

export default ProductList;