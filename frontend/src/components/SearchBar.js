import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './style.component/SearchBar.module.css';

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate(`/products?search=${searchTerm}`);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.searchBar}>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Tìm kiếm sản phẩm..."
        className={styles.searchInput}
      />
      <button type="submit" className={styles.searchButton}>Tìm kiếm</button>
    </form>
  );
};

export default SearchBar;
