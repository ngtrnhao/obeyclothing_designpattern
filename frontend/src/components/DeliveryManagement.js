import React, { useState, useEffect } from 'react';
import { getDeliveries, updateDeliveryStatus } from '../services/api';
import { FaSort, FaSearch } from 'react-icons/fa';
import TableLayout from './common/TableLayout';
import useTableControls from '../hooks/useTableControls';
import styles from './style.component/DeliveryManagement.module.css';
import { toast } from 'react-toastify';
import { Badge, FormGroup, Input } from 'reactstrap';

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

  // Trong file frontend/src/components/DeliveryManagement.js
const handleStatusChange = async (deliveryId, newStatus) => {
  try {
    // Tìm delivery trong danh sách
    const delivery = deliveries.find(d => d._id === deliveryId);
    if (!delivery) {
      toast.error('Không tìm thấy đơn giao hàng');
      return;
    }

    // Kiểm tra nếu trạng thái không thay đổi
    if (delivery.status === newStatus) {
      toast.info(`Đơn giao hàng đã ở trạng thái ${getStatusText(newStatus)}`);
      return;
    }

    // Kiểm tra tính hợp lệ của chuyển đổi
    const isValidTransition = checkValidDeliveryTransition(delivery.status, newStatus);
    if (!isValidTransition) {
      toast.error(`Không thể chuyển từ trạng thái ${getStatusText(delivery.status)} sang ${getStatusText(newStatus)}`);
      return;
    }

    setLoading(true);
    const response = await updateDeliveryStatus(deliveryId, newStatus);
    
    if (response.success) {
      toast.success(response.message || 'Cập nhật trạng thái thành công');
      
      // Tải lại toàn bộ danh sách thay vì cập nhật cục bộ
      await fetchDeliveries();
    } else {
      toast.error(response.message || 'Lỗi khi cập nhật trạng thái');
    }
  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái:', error);
    const errorMessage = error.response?.data?.message || 
                         (error.response?.data?.success === false ? error.response.data.message : 
                         'Lỗi khi cập nhật trạng thái');
    toast.error(errorMessage);
  } finally {
    setLoading(false);
  }
};

  // Hàm kiểm tra tính hợp lệ của chuyển đổi trạng thái
  const checkValidDeliveryTransition = (currentStatus, newStatus) => {
    // Đồ thị chuyển trạng thái
    const validTransitions = {
      'pending': ['shipping', 'cancelled'],
      'shipping': ['delivered', 'cancelled'],
      'delivered': [],
      'cancelled': []
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
  };

  // // Hàm ánh xạ trạng thái giao hàng sang trạng thái đơn hàng
  // const mapDeliveryStatusToOrderStatus = (deliveryStatus) => {
  //   const statusMap = {
  //     'pending': 'pending',
  //     'shipping': 'shipped',
  //     'delivered': 'delivered',
  //     'cancelled': 'cancelled'
  //   };
  //   return statusMap[deliveryStatus] || deliveryStatus;
  // };

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

  // Hàm lấy danh sách trạng thái có thể chuyển đổi từ trạng thái hiện tại
  const getAvailableStatusOptions = (currentStatus) => {
    const validTransitions = {
      'pending': ['shipping', 'cancelled'],
      'shipping': ['delivered', 'cancelled'],
      'delivered': [],
      'cancelled': []
    };
    
    const statusLabels = {
      'pending': 'Chờ xử lý',
      'shipping': 'Đang giao hàng',
      'delivered': 'Đã giao hàng',
      'cancelled': 'Đã hủy'
    };
    
    return (validTransitions[currentStatus] || []).map(status => ({
      value: status,
      label: statusLabels[status] || status
    }));
  };

  // Hàm lấy màu hiển thị cho trạng thái
  const getStatusColor = (status) => {
    const colors = {
      'pending': 'warning',
      'shipping': 'info',
      'delivered': 'success',
      'cancelled': 'danger'
    };
    return colors[status] || 'secondary';
  };

  // Hàm lấy text hiển thị cho trạng thái
  const getStatusText = (status) => {
    const texts = {
      'pending': 'Chờ xử lý',
      'shipping': 'Đang giao hàng',
      'delivered': 'Đã giao hàng',
      'cancelled': 'Đã hủy'
    };
    return texts[status] || status;
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
                <Badge color={getStatusColor(delivery.status)}>
                  {getStatusText(delivery.status)}
                </Badge>
              </td>
              <td>
                <span className={`${styles.statusBadge} ${styles[delivery.order?.status]}`}>
                  {delivery.order?.status || 'N/A'}
                </span>
              </td>
              <td className={styles.actions}>
                <FormGroup>
                  <Input
                    type="select"
                    value="" // Đặt giá trị mặc định là rỗng
                    onChange={(e) => {
                      if (e.target.value) { // Chỉ xử lý khi có giá trị được chọn
                        handleStatusChange(delivery._id, e.target.value);
                        e.target.value = ''; // Reset về giá trị rỗng sau khi chọn
                      }
                    }}
                    disabled={loading}
                  >
                    <option value="">Cập nhật trạng thái</option>
                    {getAvailableStatusOptions(delivery.status).map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Input>
                </FormGroup>
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
