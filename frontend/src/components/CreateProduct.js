import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProduct, getCategories, deleteCategory } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import styles from './style.component/CreateProduct.module.css';

const CreateProduct = () => {
  const [product, setProduct] = useState({ name: '', description: '', price: '', category: '', stock: '',sizes:'',colors:'' });
  const [image, setImage] = useState(null);
  const [detailImages, setDetailImages] = useState([]);
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
      setError('Không thể tải danh sách danh mục. Vui lòng thử lại sau.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleDetailImagesChange = (e) => {
    setDetailImages(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const formData = new FormData();
    formData.append('name', product.name);
    formData.append('description', product.description);
    formData.append('price', product.price);
    formData.append('category', product.category);
    formData.append('stock', product.stock);
    formData.append('sizes', product.sizes);
    formData.append('colors', product.colors);
    
    if (image) formData.append('image', image);
    detailImages.forEach(img => formData.append('detailImages', img));

    try {
      const response = await createProduct(formData);
      console.log('Product creation response:', response);
      alert('Sản phẩm đã được tạo thành công!');
      navigate(`/products/${response.data._id}`);
    } catch (error) {
      console.error('Error creating product:', error);
      setError(error.response?.data?.message || 'Có lỗi xảy ra khi tạo sản phẩm. Vui lòng thử lại.');
    }
  };

  const handleDeleteCategory = async (categoryToDelete) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa danh mục "${categoryToDelete}"?`)) {
      try {
        await deleteCategory(categoryToDelete);
        alert('Danh mục đã được xóa thành công');
        fetchCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
        setError('Có lỗi xảy ra khi xóa danh mục. Vui lòng thử lại.');
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
        <input type="text" name="name" placeholder="Tên sản phẩm" value={product.name} onChange={handleChange} required />
        <textarea name="description" placeholder="Mô tả" value={product.description} onChange={handleChange} required />
        <input type="number" name="price" placeholder="Giá" value={product.price} onChange={handleChange} required min="0" step="0.01" />
        <div className={styles.categoryInputContainer}>
          <input 
            type="text" 
            name="category" 
            list="categories"
            placeholder="Nhập hoặc chọn danh mục" 
            value={product.category}
            onChange={handleChange}
            required 
          />
          <datalist id="categories">
            {categories.map((category, index) => (
              <option key={index} value={category}>{category}</option>
            ))}
          </datalist>
        </div>
        <input type="number" name="stock" placeholder="Số lượng trong kho" value={product.stock} onChange={handleChange} required min="0" />
        <input type="text" name="sizes" placeholder="Kích thước (cách nhau bằng dấu phẩy)" value={product.sizes} onChange={handleChange} required />
        <input type="text" name="colors" placeholder="Màu sắc (cách nhau bằng dấu phẩy)" value={product.colors} onChange={handleChange} required />
        <input type="file" onChange={handleImageChange} accept="image/*" required />
        <input type="file" multiple onChange={handleDetailImagesChange} accept="image/*" />
        <button type="submit">Tạo sản phẩm</button>
      </form>
      
      <div className={styles.categoryList}>
        <h3>Danh sách danh mục:</h3>
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