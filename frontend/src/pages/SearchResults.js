import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import styles from './style.pages/SearchResults.module.css';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const keyword = searchParams.get('keyword');

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/products/search?keyword=${keyword}`);
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching search results:', error);
      }
      setLoading(false);
    };

    if (keyword) {
      fetchResults();
    }
  }, [keyword]);

  if (loading) return <div>Đang tải...</div>;

  return (
    <div className={styles.searchResults}>
      <h1>Kết quả tìm kiếm cho "{keyword}"</h1>
      {products.length === 0 ? (
        <p>Không tìm thấy sản phẩm nào</p>
      ) : (
        <div className={styles.productsGrid}>
          {products.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResults; 