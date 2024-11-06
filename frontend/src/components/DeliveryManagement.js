import React, { useState, useEffect } from 'react';
import { getDeliveries, updateDeliveryStatus } from '../services/api';
import { FaSort, FaSearch } from 'react-icons/fa';
import TableLayout from './common/TableLayout';
import useTableControls from '../hooks/useTableControls';
import styles from './style.component/DeliveryManagement.module.css';

const DeliveryManagement = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const filterOptions = [
    { value: 'pending', label: 'Chờ xử lý' },
    { value: 'shipping', label: 'Đang giao hàng' },
    { value: 'delivered', label: 'Đã giao hàng' },
    { value: 'cancelled', label: 'Đã hủy' }
  ];

  const tableControls = useTableControls(deliveries, {
    itemsPerPage: 10,
    searchFields: [
      'order._id',
      'order.paypalOrderId',
      'order.user.username',
      'order.user.email'
    ],
    defaultSort: { key: 'createdAt', direction: 'desc' },
    filterField: 'status'
  });

  const {
    currentPage,
    setCurrentPage,
    sortConfig,
    handleSort,
    searchTerm,
    setSearchTerm,
    filterValue,
    setFilterValue,
    paginatedItems: paginatedDeliveries,
    totalPages
  } = tableControls;

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const response = await getDeliveries();
      if (Array.isArray(response.data)) {
        const validDeliveries = response.data.filter(delivery => delivery && delivery._id);
        const sortedDeliveries = validDeliveries.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        setDeliveries(sortedDeliveries);
      } else {
        setError('Dữ liệu không hợp lệ từ máy chủ.');
      }
    } catch (error) {
      setError('Không thể tải danh sách giao hàng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (deliveryId, newStatus) => {
    try {
      const response = await updateDeliveryStatus(deliveryId, newStatus);
      if (response?.data?.delivery && response?.data?.order) {
        const { delivery, order } = response.data;
        setDeliveries(prev => 
          prev.map(d => d._id === delivery._id ? 
            { ...d, status: delivery.status, order: { ...d.order, status: order.status } } : d
          )
        );
      } else {
        setError('Không thể cập nhật trạng thái giao hàng. Dữ liệu không hợp lệ.');
      }
    } catch (error) {
      setError('Không thể cập nhật trạng thái giao hàng. Vui lòng thử lại.');
    }
  };

  const handleDownloadDeliveryNote = async (deliveryId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/deliveries/${deliveryId}/delivery-note`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
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
      a.download = `delivery-note-${deliveryId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading delivery note:', error);
      alert('Có lỗi xảy ra khi tải xuống phiếu giao hàng');
    }
  };

  const renderTable = () => (
    <div className={styles.tableWrapper}>
      <table className={styles.deliveryTable}>
        <thead>
          <tr>
            <th onClick={() => handleSort('order._id')}>
              <div className={styles.headerCell}>
                <span>Mã đơn hàng</span>
                <FaSort className={sortConfig.key === 'order._id' ? styles.active : ''} />
              </div>
            </th>
            <th onClick={() => handleSort('order.paypalOrderId')}>
              <div className={styles.headerCell}>
                <span>Mã PayPal</span>
                <FaSort className={sortConfig.key === 'order.paypalOrderId' ? styles.active : ''} />
              </div>
            </th>
            <th onClick={() => handleSort('order.user.username')}>
              <div className={styles.headerCell}>
                <span>Người đặt</span>
                <FaSort className={sortConfig.key === 'order.user.username' ? styles.active : ''} />
              </div>
            </th>
            <th>Địa chỉ giao hàng</th>
            <th onClick={() => handleSort('status')}>
              <div className={styles.headerCell}>
                <span>Trạng thái giao hàng</span>
                <FaSort className={sortConfig.key === 'status' ? styles.active : ''} />
              </div>
            </th>
            <th onClick={() => handleSort('order.status')}>
              <div className={styles.headerCell}>
                <span>Trạng thái đơn hàng</span>
                <FaSort className={sortConfig.key === 'order.status' ? styles.active : ''} />
              </div>
            </th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {paginatedDeliveries.map(delivery => (
            <tr key={delivery._id} className={styles.tableRow}>
              <td>{delivery.order?._id || 'N/A'}</td>
              <td>{delivery.order?.paypalOrderId || 'N/A'}</td>
              <td className={styles.userCell}>
                {delivery.order?.user ? (
                  <div className={styles.userInfo}>
                    <span>{delivery.order.user.username || delivery.order.user.email}</span>
                  </div>
                ) : 'Không có thông tin'}
              </td>
              <td className={styles.addressCell}>
                {delivery.shippingInfo ? (
                  <div className={styles.address}>
                    {`${delivery.shippingInfo.streetAddress || ''}, 
                      ${delivery.shippingInfo.wardName || ''}, 
                      ${delivery.shippingInfo.districtName || ''}, 
                      ${delivery.shippingInfo.provinceName || ''}`.trim()}
                  </div>
                ) : 'Chưa có địa chỉ'}
              </td>
              <td>
                <span className={`${styles.statusBadge} ${styles[delivery.status]}`}>
                  {delivery.status || 'N/A'}
                </span>
              </td>
              <td>
                <span className={`${styles.statusBadge} ${styles[delivery.order?.status]}`}>
                  {delivery.order?.status || 'N/A'}
                </span>
              </td>
              <td className={styles.actions}>
                <select
                  value={delivery.status || ''}
                  onChange={(e) => handleStatusChange(delivery._id, e.target.value)}
                  className={styles.statusSelect}
                  disabled={delivery.status === 'delivered' || delivery.status === 'cancelled'}
                >
                  {filterOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <button 
                  onClick={() => handleDownloadDeliveryNote(delivery._id)}
                  className={styles.downloadButton}
                >
                  Tải phiếu giao hàng
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <TableLayout
      title="Quản lý giao hàng"
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      filterValue={filterValue}
      onFilterChange={setFilterValue}
      filterOptions={filterOptions}
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={setCurrentPage}
      loading={loading}
      error={error}
      emptyMessage="Không có đơn giao hàng nào."
    >
      {renderTable()}
    </TableLayout>
  );
};

export default DeliveryManagement;
