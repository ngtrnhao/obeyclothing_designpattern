import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCategories } from '../services/api';
import styles from './style.component/Menu.module.css';

const Menu = ({ isOpen, onClose }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await getCategories();
        setCategories(response);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError('Failed to load categories');
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const renderCategories = (categories) => {
    return categories.map((category) => (
      <div key={category._id} className={styles.categoryItem}>
        <Link 
          to={`/category/${category._id}`} 
          className={styles.categoryLink}
          onClick={onClose}
        >
          {category.name}
        </Link>
        {category.children && category.children.length > 0 && (
          <div className={styles.subcategoryList}>
            {renderCategories(category.children)}
          </div>
        )}
      </div>
    ));
  };

  if (!isOpen) return null;

  return (
    <div className={styles.menuWrapper}>
      <div className={styles.menuOverlay}>
        <button className={styles.closeButton} onClick={onClose}>&times;</button>
        <div className={styles.menuContent}>
          {loading && <p>Loading categories...</p>}
          {error && <p>{error}</p>}
          {!loading && !error && renderCategories(categories)}
        </div>
      </div>
    </div>
  );
};

export default Menu;