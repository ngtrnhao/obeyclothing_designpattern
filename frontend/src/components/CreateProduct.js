import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProduct } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import styles from './style.component/CreateProduct.module.css';

const CreateProduct = () => {
  const [product, setProduct] = useState({ name: '', description: '', price: '', category: '', stock: '' });
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

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
      // Chuyển hướng đến trang chi tiết sản phẩm vừa tạo
      navigate(`/products/${response.data._id}`);
    } catch (error) {
      console.error('Error creating product:', error.response || error);
      setError(error.response?.data?.message || 'Lỗi khi tạo sản phẩm');
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
        <input type="text" name="category" placeholder="Danh mục" onChange={handleChange} required />
        <input type="number" name="stock" placeholder="Số lượng trong kho" onChange={handleChange} required />
        <input type="file" onChange={handleImageChange} />
        <button type="submit">Tạo sản phẩm</button>
      </form>
    </div>
  );
};

export default CreateProduct;
