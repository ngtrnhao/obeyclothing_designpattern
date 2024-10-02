import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getCategories } from '../services/api';
import styles from './style.component/Menu.module.css';

const Menu = ({ isOpen, onClose }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});
  const menuRef = useRef(null);
  const timeoutRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchCategories = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    // Reset menu state when location changes
    setExpandedCategories({});
    fetchCategories();
  }, [location, fetchCategories]);

  const handleClose = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      onClose();
    }, 50);
  }, [onClose]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target) && !event.target.closest('.menuButton')) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.classList.remove('menu-open');
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isOpen, handleClose]);

  const handleCategoryClick = (category, event) => {
    event.preventDefault();
    if (category.children && category.children.length > 0) {
      setExpandedCategories(prev => ({
        ...prev,
        [category._id]: !prev[category._id]
      }));
    } else {
      navigate(`/category/${category._id}`);
      handleClose();
    }
  };

  const handleCategoryLinkClick = (category, event) => {
    event.stopPropagation();
    navigate(`/category/${category._id}`);
    handleClose();
  };

  const renderCategories = (categories) => {
    return categories.map((category) => (
      <div key={category._id} className={styles.categoryItem}>
        <div 
          className={styles.categoryHeader}
          onClick={(e) => handleCategoryClick(category, e)}
        >
          <span 
            className={styles.categoryLink}
            onClick={(e) => handleCategoryLinkClick(category, e)}
          >
            {category.name}
          </span>
          {category.children && category.children.length > 0 && (
            <span className={styles.toggleIndicator}>
              {expandedCategories[category._id] ? '▼' : '▶'}
            </span>
          )}
        </div>
        {category.children && category.children.length > 0 && expandedCategories[category._id] && (
          <div className={styles.subcategoryList}>
            {renderCategories(category.children)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className={`${styles.menuWrapper} ${isOpen ? styles.open : ''}`} ref={menuRef}>
      <div className={styles.menuOverlay}>
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