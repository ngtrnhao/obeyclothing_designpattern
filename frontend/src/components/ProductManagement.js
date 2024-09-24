import React, { useState, useEffect } from 'react';
import { getAdminProducts, updateAdminProduct, deleteAdminProduct } from '../services/api';
import { FaSearch, FaSort, FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import styles from './style.component/ProductManagement.module.css';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(10);

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

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedProducts = React.useMemo(() => {
    let sortableProducts = [...products];
    if (sortConfig.key !== null) {
      sortableProducts.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableProducts;
  }, [products, sortConfig]);

  const filteredProducts = sortedProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) return <div className={styles.loading}>Đang tải...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.productManagement}>
      <h2>Quản lý sản phẩm</h2>
      <div className={styles.searchBar}>
        <FaSearch />
        <input
          type="text"
          placeholder="Tìm kiếm theo tên hoặc danh mục"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <table className={styles.productTable}>
        <thead>
          <tr>
            <th onClick={() => handleSort('name')}>Tên sản phẩm <FaSort /></th>
            <th onClick={() => handleSort('price')}>Giá <FaSort /></th>
            <th onClick={() => handleSort('category')}>Danh mục <FaSort /></th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {currentProducts.map(product => (
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
                /> : `${product.price.toLocaleString('vi-VN')} đ`}
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
                    <button className={styles.saveButton} onClick={handleUpdate}><FaSave /> Lưu</button>
                    <button className={styles.cancelButton} onClick={() => setEditingProduct(null)}><FaTimes /> Hủy</button>
                  </>
                ) : (
                  <>
                    <button className={styles.editButton} onClick={() => handleEdit(product)}><FaEdit /> Sửa</button>
                    <button className={styles.deleteButton} onClick={() => handleDelete(product._id)}><FaTrash /> Xóa</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className={styles.pagination}>
        {Array.from({ length: Math.ceil(filteredProducts.length / productsPerPage) }, (_, i) => (
          <button key={i} onClick={() => paginate(i + 1)} className={currentPage === i + 1 ? styles.active : ''}>
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProductManagement;