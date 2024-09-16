import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProduct, getCategories, deleteCategory } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import styles from './style.component/CreateProduct.module.css';

const CreateProduct = () => {
  const [product, setProduct] = useState({ name: '', description: '', price: '', category: '', stock: '' });
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
    } else {
      fetchCategories();
    }
  }, [user, navigate]);

  const fetchCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(product).forEach(key => formData.append(key, product[key]));
    if (image) formData.append('image', image);

    try {
      const response = await createProduct(formData);
      console.log('Product creation response:', response);
      alert('Sản phẩm đã được tạo thành công!');
      navigate(`/products/${response.data._id}`);
    } catch (error) {
      console.error('Error creating product:', error.response || error);
      setError(error.response?.data?.message || 'Lỗi khi tạo sản phẩm');
    }
  };

  const handleDeleteCategory = async (categoryToDelete) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa category "${categoryToDelete}"?`)) {
      try {
        await deleteCategory(categoryToDelete);
        alert('Category đã được xóa thành công');
        fetchCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
        let errorMessage = 'Lỗi khi xóa category';
        if (error.response) {
          errorMessage += ': ' + (error.response.data.message || error.response.statusText);
        }
        setError(errorMessage);
      }
    }
  };

  if (!user || user.role !== 'admin') {
    return <div>Bạn không có quyền truy cập trang này</div>;
  }

  return (
    <div className={styles.createProduct}>
      <h2>Tạo sản phẩm mới</h2>
      {error && <p className={styles.error}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="Tên sản phẩm" onChange={handleChange} required />
        <textarea name="description" placeholder="Mô tả" onChange={handleChange} required />
        <input type="number" name="price" placeholder="Giá" onChange={handleChange} required />
        <div className={styles.categoryInputContainer}>
          <input 
            type="text" 
            name="category" 
            list="categories"
            placeholder="Nhập hoặc chọn danh mục" 
            onChange={handleChange}
            value={product.category}
            required 
          />
          <datalist id="categories">
            {categories.map((category, index) => (
              <option key={index} value={category}>{category}</option>
            ))}
          </datalist>
        </div>
        <input type="number" name="stock" placeholder="Số lượng trong kho" onChange={handleChange} required />
        <input type="file" onChange={handleImageChange} required />
        <button type="submit">Tạo sản phẩm</button>
      </form>
      
      <div className={styles.categoryList}>
        <h3>Danh sách categories:</h3>
        <ul>
          {categories.map((category, index) => (
            <li key={index}>
              {category}
              <button onClick={() => handleDeleteCategory(category)}>Xóa</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CreateProduct;