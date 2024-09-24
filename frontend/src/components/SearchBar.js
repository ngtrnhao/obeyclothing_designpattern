import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate,useLocation } from 'react-router-dom';
import { getProducts } from '../services/api';
import styles from './style.component/SearchBar.module.css';
import { debounce } from 'lodash';
import { FaSearch, FaTimes, FaFilter } from 'react-icons/fa';

const SearchBar = ({ onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef(null);
  const filterRef = useRef(null);

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
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilters(false);
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
  }, [searchTerm]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedFetchSuggestions = useCallback(debounce(() => fetchSuggestions(), 300), [fetchSuggestions]);

  useEffect(() => {
    debouncedFetchSuggestions();
    return debouncedFetchSuggestions.cancel;
  }, [searchTerm, debouncedFetchSuggestions]);

  const formatPrice = (value) => {
    // Loại bỏ tất cả các ký tự không phải số
    const numericValue = value.replace(/[^0-9]/g, '');
    // Chuyển đổi thành số và định dạng với dấu phân cách hàng nghìn
    return Number(numericValue).toLocaleString('vi-VN');
  };

  const handlePriceChange = (type, value) => {
    const formattedValue = formatPrice(value);
    setPriceRange(prev => ({ ...prev, [type]: formattedValue }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim() || selectedCategory || priceRange.min || priceRange.max) {
      const searchParams = new URLSearchParams();
      if (searchTerm.trim()) searchParams.set('search', searchTerm);
      if (selectedCategory) searchParams.set('category', selectedCategory);
      if (priceRange.min) searchParams.set('minPrice', priceRange.min.replace(/\D/g, ''));
      if (priceRange.max) searchParams.set('maxPrice', priceRange.max.replace(/\D/g, ''));
      navigate(`/products?${searchParams.toString()}`);
      setShowSuggestions(false);
      setShowFilters(false);
    }
  };

  const handleSuggestionClick = (productId) => {
    navigate(`/products/${productId}`);
    setShowSuggestions(false);
  };

  return (
    <div className={styles.searchBar}>
      <form onSubmit={handleSubmit}>
        <div className={styles.searchInputWrapper}>
          <FaSearch className={styles.searchIcon} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm sản phẩm..."
            className={styles.searchInput}
            // Remove the autoFocus attribute if it exists
          />
          {searchTerm && (
            <button type="button" className={styles.clearButton} onClick={() => setSearchTerm('')}>
              <FaTimes />
            </button>
          )}
        </div>
        <div className={styles.filterContainer} ref={filterRef}>
          <button 
            type="button" 
            className={styles.filterButton} 
            onClick={() => setShowFilters(!showFilters)}
          >
            <FaFilter />
          </button>
          {showFilters && (
            <div className={styles.filters}>
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
                type="text"
                value={priceRange.min}
                onChange={(e) => handlePriceChange('min', e.target.value)}
                placeholder="Giá tối thiểu"
                className={styles.priceInput}
              />
              <input
                type="text"
                value={priceRange.max}
                onChange={(e) => handlePriceChange('max', e.target.value)}
                placeholder="Giá tối đa"
                className={styles.priceInput}
              />
            </div>
          )}
        </div>
      </form>
      <button className={styles.closeButton} onClick={onClose}>
        <FaTimes />
      </button>
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