import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProduct, getCategories } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import styles from './style.component/CreateProduct.module.css';

const CreateProduct = () => {
  const [product, setProduct] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    stock: '',
    sizes: '',
    colors: ''
  });
  const [image, setImage] = useState(null);
  const [detailImages, setDetailImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories();
        console.log('Fetched categories:', response);
        setCategories(response);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError('Không thể tải danh sách danh mục');
      }
    };

    fetchCategories();
  }, []);

  const handleProductChange = (e) => {
    const { name, value } = e.target;
    console.log('Changing product:', name, value);
    setProduct(prevProduct => ({
      ...prevProduct,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleDetailImagesChange = (e) => {
    setDetailImages(Array.from(e.target.files));
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const formData = new FormData();
    formData.append('name', product.name);
    formData.append('description', product.description);
    formData.append('price', product.price);
    formData.append('categoryId', product.categoryId);
    formData.append('stock', product.stock);
    formData.append('sizes', product.sizes);
    formData.append('colors', product.colors);

    if (image) {
      formData.append('image', image);
    }

    detailImages.forEach((img, index) => {
      formData.append(`detailImages`, img);
    });

    try {
      const response = await createProduct(formData);
      console.log('Product created:', response);
      navigate('/admin/products');
    } catch (error) {
      console.error('Error creating product:', error);
      setError(error.response?.data?.message || 'Có lỗi xảy ra khi tạo sản phẩm');
    }
  };

  const renderCategories = (categories, level = 0) => {
    return categories.flatMap((category) => [
      <option 
        key={category._id} 
        value={category._id} 
        disabled={category.children && category.children.length > 0}
        style={{ paddingLeft: `${level * 20}px` }}
      >
        {'-'.repeat(level)} {category.name}
      </option>,
      ...(category.children ? renderCategories(category.children, level + 1) : [])
    ]);
  };

  if (!user || user.role !== 'admin') {
    return <div>Bạn không có quyền truy cập trang này</div>;
  }

  return (
    <div className={styles.createProduct}>
      <h2>Tạo sản phẩm mới</h2>
      {error && <p className={styles.error}>{error}</p>}
      <form onSubmit={handleProductSubmit}>
        <input type="text" name="name" placeholder="Tên sản phẩm" value={product.name} onChange={handleProductChange} required />
        <textarea name="description" placeholder="Mô tả" value={product.description} onChange={handleProductChange} required />
        <input type="number" name="price" placeholder="Giá" value={product.price} onChange={handleProductChange} required min="0" step="0.01" />
        <select 
          name="categoryId" 
          value={product.categoryId} 
          onChange={handleProductChange} 
          required
        >
          <option value="">Chọn danh mục</option>
          {renderCategories(categories)}
        </select>
        <input type="number" name="stock" placeholder="Số lượng trong kho" value={product.stock} onChange={handleProductChange} required min="0" />
        <input type="text" name="sizes" placeholder="Kích thước (cách nhau bằng dấu phẩy)" value={product.sizes} onChange={handleProductChange} required />
        <input type="text" name="colors" placeholder="Màu sắc (cách nhau bằng dấu phẩy)" value={product.colors} onChange={handleProductChange} required />
        <input type="file" onChange={handleImageChange} accept="image/*" required />
        <input type="file" multiple onChange={handleDetailImagesChange} accept="image/*" />
        <button type="submit">Tạo sản phẩm</button>
      </form>
    </div>
  );
};

export default CreateProduct;