import React, { useState, useEffect } from 'react';
import { getPurchaseOrders, updatePurchaseOrder, createPurchaseOrder, getAdminProducts, getSuppliers, confirmReceiptAndUpdateInventory } from '../services/api';
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
    notes: '',
  });
  const [actualQuantities, setActualQuantities] = useState({});

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

  const handleUpdateOrder = async (orderId, status, actualQuantity = null) => {
    try {
      if (status === 'received') {
        if (!actualQuantity || isNaN(parseInt(actualQuantity))) {
          alert('Vui lòng nhập số lượng thực tế hợp lệ');
          return;
        }

        // Tìm đơn đặt hàng hiện tại
        const currentOrder = purchaseOrders.find(order => order._id === orderId);
        if (!currentOrder) {
          alert('Không tìm thấy thông tin đơn đặt hàng');
          return;
        }

        // Kiểm tra số lượng thực nhận
        if (parseInt(actualQuantity) > currentOrder.suggestedQuantity) {
          alert(`Số lượng thực nhận (${actualQuantity}) không thể lớn hơn số lượng đề xuất (${currentOrder.suggestedQuantity})`);
          return;
        }

        await confirmReceiptAndUpdateInventory(orderId, parseInt(actualQuantity));
      } else {
        await updatePurchaseOrder(orderId, { status });
      }
      fetchPurchaseOrders();
      // Xóa số lượng thực tế sau khi cập nhật thành công
      setActualQuantities(prev => {
        const newQuantities = {...prev};
        delete newQuantities[orderId];
        return newQuantities;
      });
    } catch (error) {
      console.error('Lỗi khi cập nhật đơn đặt hàng:', error);
      alert(`Đã xảy ra lỗi khi cập nhật đơn đặt hàng: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleDownloadPDF = async (orderId, type) => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = type === 'receipt' ? 'receipt-pdf' : 'pdf';
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/purchase-orders/${orderId}/${endpoint}`, {
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
      a.download = type === 'receipt' ? `receipt-confirmation-${orderId}.pdf` : `purchase-order-${orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      alert(`${type === 'receipt' ? 'Phiếu nhập kho' : 'Phiếu đặt hàng'} đã được tải xuống thành công`);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Có lỗi xảy ra khi tải xuống PDF. Vui lòng thử lại.');
    }
  };

  const handleNewOrderChange = (e) => {
    const { name, value } = e.target;
    
    // Xác thực số lượng đề xuất phải là số dương
    if (name === 'suggestedQuantity') {
      const quantity = parseInt(value);
      if (isNaN(quantity) || quantity <= 0) {
        alert('Số lượng đặt hàng phải là số dương');
        return;
      }
    }
    
    setNewOrder(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    try {
      // Kiểm tra lại số lượng trước khi gửi yêu cầu
      const quantity = parseInt(newOrder.suggestedQuantity);
      if (isNaN(quantity) || quantity <= 0) {
        alert('Số lượng đặt hàng phải là số dương');
        return;
      }
      
      const response = await createPurchaseOrder({
        product: newOrder.product,
        suggestedQuantity: quantity,
        supplier: newOrder.supplier,
        notes: newOrder.notes
      });

      if (response && response.purchaseOrder && response.purchaseOrder._id) {
        alert(`Đơn đặt hàng đã được tạo thành công với ID: ${response.purchaseOrder._id}`);
      } else {
        alert('Đơn đặt hàng đã được tạo thành công');
      }
      
      fetchPurchaseOrders();
      setNewOrder({ 
        product: '', 
        suggestedQuantity: 0, 
        supplier: '',
        notes: '' 
      });
    } catch (error) {
      console.error('Error creating purchase order:', error);
      alert(`Có lỗi xảy ra khi tạo đơn đặt hàng: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleActualQuantityChange = (orderId, quantity) => {
    const currentOrder = purchaseOrders.find(order => order._id === orderId);
    if (currentOrder && parseInt(quantity) > currentOrder.suggestedQuantity) {
      alert(`Số lượng thực nhận không thể lớn hơn số lượng đề xuất (${currentOrder.suggestedQuantity})`);
      return;
    }
    setActualQuantities(prev => ({
      ...prev,
      [orderId]: quantity
    }));
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
          min="1"
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
              <td>{order.product ? order.product.name : 'Unknown Product'}</td>
              <td>{order.suggestedQuantity}</td>
              <td>
                {order.status === 'approved' ? (
                  <input
                    type="number"
                    value={actualQuantities[order._id] || ''}
                    onChange={(e) => handleActualQuantityChange(order._id, e.target.value)}
                    min="1"
                    max={order.suggestedQuantity}
                    placeholder="Nhập số lượng thực nhận"
                    className={styles.quantityInput}
                  />
                ) : (
                  order.actualQuantity || order.suggestedQuantity
                )}
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
                    <button onClick={() => handleUpdateOrder(order._id, 'approved')}>
                      Phê duyệt
                    </button>
                    <button onClick={() => handleUpdateOrder(order._id, 'cancelled')}>
                      Hủy bỏ
                    </button>
                  </>
                )}
                {order.status === 'approved' && (
                  <button onClick={() => handleUpdateOrder(order._id, 'received', actualQuantities[order._id])}>
                    Xác nhận nhận hàng
                  </button>
                )}
                <button onClick={() => handleDownloadPDF(order._id, 'order')}>
                  Tải phiếu đặt hàng
                </button>
                {order.status === 'received' && (
                  <button onClick={() => handleDownloadPDF(order._id, 'receipt')}>
                    Tải phiếu nhập kho
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PurchaseOrderManagement;
