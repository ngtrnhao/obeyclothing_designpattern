import React, { useState, useEffect } from 'react';
import { getPurchaseOrders, updatePurchaseOrder, createPurchaseOrder, getAdminProducts, getSuppliers } from '../services/api';
import styles from './style.component/PurchaseOrderManagement.module.css';

const PurchaseOrderManagement = () => {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newOrder, setNewOrder] = useState({
    product: '',
    suggestedQuantity: 0,
    supplier: '',
  });

  useEffect(() => {
    fetchPurchaseOrders();
    fetchProducts();
    fetchSuppliers();
  }, []);

  const fetchPurchaseOrders = async () => {
    try {
      setLoading(true);
      const response = await getPurchaseOrders();
      setPurchaseOrders(response.data || []); // Ensure it's always an array
      setLoading(false);
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
      setError('Unable to load purchase orders. Please try again later.');
      setPurchaseOrders([]); // Set to empty array in case of error
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await getAdminProducts(); // Đảm bảo đang sử dụng đúng API call
      if (Array.isArray(response.data)) {
        setProducts(response.data);
      } else if (response.data && Array.isArray(response.data.products)) {
        setProducts(response.data.products);
      } else {
        throw new Error('Dữ liệu sản phẩm không hợp lệ');
      }
      setLoading(false);
    } catch (error) {
      console.error('Lỗi khi tải danh sách sản phẩm:', error);
      setError('Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.');
      setProducts([]);
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await getSuppliers();
      setSuppliers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Lỗi khi tải danh sách nhà cung cấp:', error);
      setError('Không thể tải danh sách nhà cung cấp. Vui lòng thử lại sau.');
      setSuppliers([]);
      setLoading(false);
    }
  };

  const handleUpdateOrder = async (orderId, status, actualQuantity, notes) => {
    try {
      await updatePurchaseOrder(orderId, { status, actualQuantity, notes });
      fetchPurchaseOrders();
    } catch (error) {
      console.error('Error updating purchase order:', error);
      alert('An error occurred while updating the purchase order. Please try again.');
    }
  };

  const handleDownloadPDF = async (orderId) => {
    try {
      console.log('Downloading PDF for order:', orderId);
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/purchase-orders/${orderId}/pdf`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `purchase-order-${orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      alert('PDF đã được tải xuống thành công');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Có lỗi xảy ra khi tải xuống PDF. Vui lòng thử lại.');
    }
  };

  const handleNewOrderChange = (e) => {
    const { name, value } = e.target;
    setNewOrder(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    try {
      const response = await createPurchaseOrder({
        product: newOrder.product,
        suggestedQuantity: parseInt(newOrder.suggestedQuantity),
        supplier: newOrder.supplier,
      });
      fetchPurchaseOrders();
      setNewOrder({ product: '', suggestedQuantity: 0, supplier: '' });
    } catch (error) {
      console.error('Error creating purchase order:', error);
      alert('Có lỗi xảy ra khi tạo đơn đặt hàng. Vui lòng thử lại.');
    }
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.purchaseOrderManagement}>
      <h2>Quản lý đơn đặt hàng</h2>
      
      <form onSubmit={handleCreateOrder} className={styles.createOrderForm}>
        <h3>Tạo đơn đặt hàng mới</h3>
        <select
          name="supplier"
          value={newOrder.supplier}
          onChange={handleNewOrderChange}
          required
        >
          <option value="">Chọn nhà cung cấp</option>
          {suppliers.map(supplier => (
            <option key={supplier._id} value={supplier._id}>{supplier.name}</option>
          ))}
        </select>
        <select
          name="product"
          value={newOrder.product}
          onChange={handleNewOrderChange}
          required
        >
          <option value="">Chọn sản phẩm</option>
          {products.map(product => (
            <option key={product._id} value={product._id}>{product.name}</option>
          ))}
        </select>
        <input
          type="number"
          name="suggestedQuantity"
          value={newOrder.suggestedQuantity}
          onChange={handleNewOrderChange}
          placeholder="Số lượng đề xuất"
          required
        />
        <textarea
          name="notes"
          value={newOrder.notes}
          onChange={handleNewOrderChange}
          placeholder="Ghi chú"
        />
        <button type="submit">Tạo đơn đặt hàng</button>
      </form>

      <table className={styles.orderTable}>
        <thead>
          <tr>
            <th>Product</th>
            <th>Suggested Quantity</th>
            <th>Actual Quantity</th>
            <th>Status</th>
            <th>Notes</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {purchaseOrders.map(order => (
            <tr key={order._id}>
              <td>{order.product.name}</td>
              <td>{order.suggestedQuantity}</td>
              <td>
                <input 
                  type="number" 
                  defaultValue={order.actualQuantity || order.suggestedQuantity}
                  onChange={(e) => handleUpdateOrder(order._id, order.status, e.target.value, order.notes)}
                />
              </td>
              <td>{order.status}</td>
              <td>
                <input 
                  type="text" 
                  defaultValue={order.notes}
                  onChange={(e) => handleUpdateOrder(order._id, order.status, order.actualQuantity, e.target.value)}
                />
              </td>
              <td>
                {order.status === 'pending' && (
                  <>
                    <button onClick={() => handleUpdateOrder(order._id, 'approved', order.actualQuantity, order.notes)}>
                      Approve
                    </button>
                    <button onClick={() => handleUpdateOrder(order._id, 'rejected', order.actualQuantity, order.notes)}>
                      Reject
                    </button>
                  </>
                )}
                <button onClick={() => handleDownloadPDF(order._id)}>
                  Download PDF
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PurchaseOrderManagement;