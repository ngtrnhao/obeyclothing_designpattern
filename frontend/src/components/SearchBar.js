import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getProducts } from '../services/api';
import styles from './style.component/SearchBar.module.css';
import { debounce } from 'lodash';

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef(null);

  useEffect(() => {
    setSearchTerm('');
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedCategory('');
    setPriceRange({ min: '', max: '' });
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getProducts({ limit: 0, fields: 'category' });
        const uniqueCategories = [...new Set(response.data.map(product => product.category))];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const fetchSuggestions = useCallback(async () => {
    if (searchTerm.length > 2) {
      try {
        const params = {
          search: searchTerm,
          limit: 5,
          category: selectedCategory,
          minPrice: priceRange.min,
          maxPrice: priceRange.max
        };
        const response = await getProducts(params);
        setSuggestions(response.data);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchTerm, selectedCategory, priceRange]);

  const debouncedFetchSuggestions = useCallback(debounce(fetchSuggestions, 300), [fetchSuggestions]);

  useEffect(() => {
    debouncedFetchSuggestions();
    return debouncedFetchSuggestions.cancel;
  }, [searchTerm, selectedCategory, priceRange, debouncedFetchSuggestions]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim() || selectedCategory || priceRange.min || priceRange.max) {
      const searchParams = new URLSearchParams();
      if (searchTerm.trim()) searchParams.set('search', searchTerm);
      if (selectedCategory) searchParams.set('category', selectedCategory);
      if (priceRange.min) searchParams.set('minPrice', priceRange.min);
      if (priceRange.max) searchParams.set('maxPrice', priceRange.max);
      navigate(`/products?${searchParams.toString()}`);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (productId) => {
    navigate(`/products/${productId}`);
    setShowSuggestions(false);
  };

  return (
    <div className={styles.searchBarContainer} ref={searchRef}>
      <form onSubmit={handleSubmit} className={styles.searchBar}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm kiếm sản phẩm..."
          className={styles.searchInput}
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className={styles.categorySelect}
        >
          <option value="">Tất cả danh mục</option>
          {categories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        <input
          type="number"
          value={priceRange.min}
          onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
          placeholder="Giá tối thiểu"
          className={styles.priceInput}
        />
        <input
          type="number"
          value={priceRange.max}
          onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
          placeholder="Giá tối đa"
          className={styles.priceInput}
        />
        <button type="submit" className={styles.searchButton}>Tìm kiếm</button>
      </form>
      {showSuggestions && suggestions.length > 0 && (
        <ul className={styles.suggestions}>
          {suggestions.map((product) => (
            <li key={product._id} onClick={() => handleSuggestionClick(product._id)}>
              <img src={`${process.env.REACT_APP_API_URL}${product.image}`} alt={product.name} className={styles.suggestionImage} />
              <div className={styles.suggestionInfo}>
                <span className={styles.suggestionName}>{product.name}</span>
                <span className={styles.suggestionPrice}>{product.price.toLocaleString('vi-VN')} đ</span>
                <span className={styles.suggestionCategory}>{product.category}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
