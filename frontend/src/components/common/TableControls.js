import React from 'react';
import { FaSearch } from 'react-icons/fa';
import styles from '../style.component/TableLayout.module.css';

const TableControls = ({ 
  searchTerm, 
  onSearchChange, 
  filterValue, 
  onFilterChange,
  filterOptions 
}) => {
  return (
    <div className={styles.controls}>
      <div className={styles.searchWrapper}>
        <FaSearch className={styles.searchIcon} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm kiếm theo ID, tên người dùng hoặc email..."
          className={styles.searchInput}
        />
      </div>
      
      <select
        value={filterValue}
        onChange={(e) => onFilterChange(e.target.value)}
        className={styles.filterSelect}
      >
        <option value="all">Tất cả trạng thái</option>
        {filterOptions?.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TableControls; 