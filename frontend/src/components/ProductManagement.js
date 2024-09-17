import React, { useState, useEffect } from 'react';
import { getAdminProducts, updateAdminProduct, deleteAdminProduct } from '../services/api';
import styles from './style.component/ProductManagement.module.css';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await getAdminProducts();
      setProducts(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct({ ...product });
  };

  const handleUpdate = async () => {
    try {
      await updateAdminProduct(editingProduct._id, editingProduct);
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      console.error('Error updating product:', error);
      setError('Không thể cập nhật sản phẩm. Vui lòng thử lại sau.');
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      try {
        await deleteAdminProduct(productId);
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        setError('Không thể xóa sản phẩm. Vui lòng thử lại sau.');
      }
    }
  };

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.productManagement}>
      <h2>Quản lý sản phẩm</h2>
      <table className={styles.productTable}>
        <thead>
          <tr>
            <th>Tên sản phẩm</th>
            <th>Giá</th>
            <th>Danh mục</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={product._id}>
              <td>{editingProduct && editingProduct._id === product._id ? 
                <input 
                  value={editingProduct.name} 
                  onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                /> : product.name}
              </td>
              <td>{editingProduct && editingProduct._id === product._id ? 
                <input 
                  type="number" 
                  value={editingProduct.price} 
                  onChange={(e) => setEditingProduct({...editingProduct, price: e.target.value})}
                /> : product.price}
              </td>
              <td>{editingProduct && editingProduct._id === product._id ? 
                <input 
                  value={editingProduct.category} 
                  onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}
                /> : product.category}
              </td>
              <td>
                {editingProduct && editingProduct._id === product._id ? (
                  <>
                    <button onClick={handleUpdate}>Lưu</button>
                    <button onClick={() => setEditingProduct(null)}>Hủy</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleEdit(product)}>Sửa</button>
                    <button onClick={() => handleDelete(product._id)}>Xóa</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductManagement;