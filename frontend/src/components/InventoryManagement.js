import React, { useState, useEffect } from 'react';
import { getAdminProducts, updateStock, getLowStockProducts } from '../services/api';
import styles from './style.component/InventoryManagement.module.css';

const InventoryManagement = () => {
  const [products, setProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
    fetchLowStockProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await getAdminProducts();
      if (Array.isArray(response.data)) {
        setProducts(response.data);
      } else if (response.data && Array.isArray(response.data.products)) {
        setProducts(response.data.products);
      } else {
        throw new Error('Dữ liệu sản phẩm không hợp lệ');
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách sản phẩm:', error);
      setError('Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const fetchLowStockProducts = async () => {
    try {
      const response = await getLowStockProducts();
      if (Array.isArray(response.data)) {
        setLowStockProducts(response.data);
      } else {
        console.error('Dữ liệu sản phẩm sắp hết hàng không hợp lệ:', response.data);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách sản phẩm sắp hết hàng:', error);
    }
  };

  const handleUpdateStock = async (productId, newStock) => {
    try {
      await updateStock(productId, newStock);
      fetchProducts();
      fetchLowStockProducts();
    } catch (error) {
      console.error('Lỗi khi cập nhật số lượng tồn kho:', error);
      alert('Có lỗi xảy ra khi cập nhật số lượng tồn kho. Vui lòng thử lại.');
    }
  };

  if (loading) return <div className={styles.loading}>Đang tải...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.inventoryManagement}>
      <h2>Quản lý kho hàng</h2>
      
      <section className={styles.lowStockSection}>
        <h3>Sản phẩm sắp hết hàng</h3>
        {lowStockProducts.length > 0 ? (
          <ul className={styles.productList}>
            {lowStockProducts.map(product => (
              <li key={product._id} className={styles.productItem}>
                <span>{product.name}</span>
                <span>Số lượng: {product.stock}</span>
                <input 
                  type="number" 
                  defaultValue={product.stock}
                  min="0"
                  onChange={(e) => handleUpdateStock(product._id, e.target.value)}
                  className={styles.stockInput}
                />
              </li>
            ))}
          </ul>
        ) : (
          <p>Không có sản phẩm nào sắp hết hàng.</p>
        )}
      </section>

      <section className={styles.allProductsSection}>
        <h3>Tất cả sản phẩm</h3>
        {products.length > 0 ? (
          <ul className={styles.productList}>
            {products.map(product => (
              <li key={product._id} className={styles.productItem}>
                <span>{product.name}</span>
                <span>Số lượng: {product.stock}</span>
                <input 
                  type="number" 
                  defaultValue={product.stock}
                  min="0"
                  onChange={(e) => handleUpdateStock(product._id, e.target.value)}
                  className={styles.stockInput}
                />
              </li>
            ))}
          </ul>
        ) : (
          <p>Không có sản phẩm nào.</p>
        )}
      </section>
    </div>
  );
};

export default InventoryManagement;