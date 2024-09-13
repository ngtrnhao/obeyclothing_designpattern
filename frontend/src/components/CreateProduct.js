import React, { useState } from 'react';
import { createProduct } from '../services/api';
import { useNavigate } from 'react-router-dom';
import styles from './style.component/CreateProduct.module.css';

const CreateProduct = () => {
  const [product, setProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: ''
  });
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', product.name);
    formData.append('description', product.description);
    formData.append('price', product.price);
    formData.append('category', product.category);
    formData.append('stock', product.stock);
    if (image) {
      formData.append('image', image);
    }

    try {
      const response = await createProduct(formData);
      console.log('Product created:', response.data);
      setMessage({ text: 'Sản phẩm đã được tạo thành công', type: 'success' });
      // ... rest of your success handling
    } catch (error) {
      console.error('Error creating product:', error.response?.data || error.message);
      setMessage({ text: 'Lỗi khi tạo sản phẩm: ' + (error.response?.data?.message || error.message), type: 'error' });
    }
  };

  return (
    <div className={styles.createProduct}>
      <h2>Tạo sản phẩm mới</h2>
      {message.text && (
        <p className={`${styles.message} ${styles[message.type]}`}>{message.text}</p>
      )}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          value={product.name}
          onChange={handleChange}
          placeholder="Tên sản phẩm"
          required
        />
        <textarea
          name="description"
          value={product.description}
          onChange={handleChange}
          placeholder="Mô tả"
          required
        />
        <input
          type="number"
          name="price"
          value={product.price}
          onChange={handleChange}
          placeholder="Giá"
          required
        />
        <input
          type="text"
          name="category"
          value={product.category}
          onChange={handleChange}
          placeholder="Danh mục"
          required
        />
        <input
          type="number"
          name="stock"
          value={product.stock}
          onChange={handleChange}
          placeholder="Số lượng trong kho"
          required
        />
        <input
          type="file"
          name="image"
          onChange={handleImageChange}
          accept="image/*"
          required
        />
        <button type="submit">Tạo sản phẩm</button>
      </form>
    </div>
  );
};

export default CreateProduct;
