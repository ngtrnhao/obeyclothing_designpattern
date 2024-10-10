import React, { useState, useEffect, useCallback } from 'react';
import { getCategories, createCategory, deleteCategory } from '../services/api';
import styles from './style.component/CategoryManagement.module.css';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: '', slug: '', parentId: '' });
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
    try {
      const categoryData = {
        name: newCategory.name,
        parentId: newCategory.parentId || null
      };
      if (newCategory.slug && newCategory.slug.trim() !== '') {
        categoryData.slug = newCategory.slug.trim();
      }
      const response = await createCategory(categoryData);
      setCategories(prevCategories => [...prevCategories, response]);
      setNewCategory({ name: '', slug: '', parentId: '' });
      setSuccess('Danh mục đã được tạo thành công');
      setError('');
      fetchCategories();
    } catch (error) {
      setError(error.response?.data?.message || 'Lỗi khi tạo danh mục');
      setSuccess('');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
      try {
        await deleteCategory(categoryId);
        setSuccess('Danh mục đã được xóa thành công');
        setError('');
        fetchCategories();
      } catch (error) {
        setError(error.response?.data?.message || 'Có lỗi xảy ra khi xóa danh mục');
        setSuccess('');
      }
    }
  };

  const renderCategories = (categories, level = 0) => {
    return categories.map(category => (
      <React.Fragment key={category._id}>
        <div className={styles.categoryItem} style={{ marginLeft: `${level * 20}px` }}>
          <span className={styles.categoryName}>{category.name} - {category.slug}</span>
          <button className={styles.deleteButton} onClick={() => handleDeleteCategory(category._id)}>Xóa</button>
        </div>
        {category.children && category.children.length > 0 && renderCategories(category.children, level + 1)}
      </React.Fragment>
    ));
  };

  return (
    <div className={styles.categoryManagement}>
      <h2>Quản lý danh mục</h2>
      {error && <p className={styles.error}>{error}</p>}
      {success && <p className={styles.success}>{success}</p>}
      <form onSubmit={handleCreateCategory} className={styles.form}>
        <input
          type="text"
          name="name"
          value={newCategory.name}
          onChange={handleInputChange}
          placeholder="Tên danh mục mới"
          required
          className={styles.input}
        />
        <input
          type="text"
          name="slug"
          value={newCategory.slug}
          onChange={handleInputChange}
          placeholder="Slug danh mục (tùy chọn)"
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
        {renderCategories(categories)}
      </div>
    </div>
  );
};

export default CategoryManagement;