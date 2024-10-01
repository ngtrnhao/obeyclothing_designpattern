import React, { useState, useEffect, useCallback } from 'react';
import { getCategories, createCategory, deleteCategory } from '../services/api';
import styles from './style.component/CategoryManagement.module.css';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: '', parentId: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchCategories = useCallback(async () => {
    try {
      const response = await getCategories();
      setCategories(response);
    } catch (error) {
      setError('Không thể tải danh sách danh mục. Vui lòng thử lại sau.');
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCategory(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await createCategory(newCategory);
      setSuccess('Danh mục đã được tạo thành công');
      setNewCategory({ name: '', parentId: '' });
      fetchCategories();
    } catch (error) {
      setError(error.response?.data?.message || 'Có lỗi xảy ra khi tạo danh mục');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
      try {
        await deleteCategory(categoryId);
        setSuccess('Danh mục đã được xóa thành công');
        fetchCategories();
      } catch (error) {
        setError('Có lỗi xảy ra khi xóa danh mục');
      }
    }
  };

  const renderCategories = (categories, level = 0) => {
    return categories.map((category) => (
      <li key={category._id} className={styles.categoryItem} style={{ marginLeft: `${level * 20}px` }}>
        {category.name}
        <button onClick={() => handleDeleteCategory(category._id)} className={styles.deleteButton}>Xóa</button>
        {category.children && category.children.length > 0 && (
          <ul className={styles.categoryList}>
            {renderCategories(category.children, level + 1)}
          </ul>
        )}
      </li>
    ));
  };

  return (
    <div className={styles.categoryManagement}>
      <h2>Quản lý danh mục</h2>
      {error && <p className={styles.error}>{error}</p>}
      {success && <p className={styles.success}>{success}</p>}
      <form onSubmit={handleCreateCategory} className={styles.categoryForm}>
        <input
          type="text"
          name="name"
          placeholder="Tên danh mục mới"
          value={newCategory.name}
          onChange={handleInputChange}
          required
          className={styles.input}
        />
        <select
          name="parentId"
          value={newCategory.parentId}
          onChange={handleInputChange}
          className={styles.select}
        >
          <option value="">Không có danh mục cha</option>
          {categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>
        <button type="submit" className={styles.button}>Tạo danh mục</button>
      </form>
      <div className={styles.categoryListContainer}>
        <h3>Danh sách danh mục:</h3>
        <ul className={styles.categoryList}>
          {renderCategories(categories)}
        </ul>
      </div>
    </div>
  );
};

export default CategoryManagement;