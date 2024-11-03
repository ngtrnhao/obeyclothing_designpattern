import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaTimes } from 'react-icons/fa';
import styles from './style.component/SearchBar.module.css';

const SearchBar = ({ onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();

  const imageUrl = (img) => {
    if (!img) return '/images/placeholder-image.jpg';
    if (img.startsWith('http')) return img;
    const cleanedPath = img.replace(/^uploads\\/, '');
    return `${process.env.REACT_APP_API_URL}/uploads/${cleanedPath}`;
  };

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchTerm.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/products/search/suggestions?q=${searchTerm}`
        );
        const data = await response.json();
        setSuggestions(data);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?keyword=${encodeURIComponent(searchTerm.trim())}`);
      setShowSuggestions(false);
      onClose?.();
    }
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
            autoFocus
          />
          {searchTerm ? (
            <button 
              type="button"
              className={styles.clearButton}
              onClick={() => setSearchTerm('')}
            >
              <FaTimes />
            </button>
          ) : (
            <button 
              type="button"
              className={styles.closeButton}
              onClick={onClose}
            >
              <FaTimes />
            </button>
          )}
        </div>
      </form>
      {showSuggestions && suggestions.length > 0 && (
        <ul className={styles.suggestions}>
          {suggestions.map((product) => (
            <li 
              key={product._id}
              onClick={() => {
                navigate(`/product/${product.slug}`);
                setShowSuggestions(false);
                onClose?.();
              }}
            >
              <img 
                src={imageUrl(product.image)}
                alt={product.name} 
              />
              <div>
                <span>{product.name}</span>
                <span>{product.price.toLocaleString('vi-VN')}đ</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;