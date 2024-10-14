import React, { useState, useEffect } from 'react';
import { getVouchers, createVoucher, updateVoucher, deleteVoucher } from '../services/voucherService';
import styles from './style.component/VoucherManagement.module.css';

const VoucherManagement = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newVoucher, setNewVoucher] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: 0,
    maxDiscount: 0,
    minPurchase: 0,
    startDate: '',
    endDate: '',
    usageLimit: 1,
    isActive: true
  });

  useEffect(() => {
    fetchVouchers();
  }, []);

  useEffect(() => {
    console.log('Current vouchers:', vouchers);
  }, [vouchers]);

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const response = await getVouchers();
      console.log('Dữ liệu voucher nhận được:', response);
      if (response && response.data && Array.isArray(response.data)) {
        setVouchers(response.data);
      } else {
        console.error('Định dạng dữ liệu không mong đợi:', response);
        setVouchers([]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách voucher:', error);
      setError('Không thể tải danh sách voucher. Vui lòng thử lại sau.');
      setVouchers([]);
      setLoading(false);
    }
  };

  const handleCreateVoucher = async (e) => {
    e.preventDefault();
    try {
      const createdVoucher = await createVoucher(newVoucher);
      setVouchers(prevVouchers => [...prevVouchers, createdVoucher]);
      setNewVoucher({
        code: '',
        discountType: 'percentage',
        discountValue: 0,
        maxDiscount: 0,
        minPurchase: 0,
        startDate: '',
        endDate: '',
        usageLimit: 1,
        isActive: true
      });
      // Không cần gọi fetchVouchers() ở đây
    } catch (error) {
      console.error('Lỗi khi tạo voucher:', error);
      setError('Không thể tạo voucher. Vui lòng thử lại sau.');
    }
  };

  const handleUpdateVoucher = async (id, updatedData) => {
    try {
      await updateVoucher(id, updatedData);
      fetchVouchers();
    } catch (error) {
      console.error('Lỗi khi cập nhật voucher:', error);
    }
  };

  const handleDeleteVoucher = async (id) => {
    try {
      await deleteVoucher(id);
      fetchVouchers();
    } catch (error) {
      console.error('Lỗi khi xóa voucher:', error);
    }
  };

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className={styles.voucherManagement}>
      <h2>Quản lý Voucher</h2>
      <form onSubmit={handleCreateVoucher} className={styles.voucherForm}>
        <input
          type="text"
          value={newVoucher.code}
          onChange={(e) => setNewVoucher({...newVoucher, code: e.target.value})}
          placeholder="Mã voucher"
          required
        />
        <select
          value={newVoucher.discountType}
          onChange={(e) => setNewVoucher({...newVoucher, discountType: e.target.value})}
        >
          <option value="percentage">Phần trăm</option>
          <option value="fixed">Số tiền cố định</option>
        </select>
        <input
          type="number"
          value={newVoucher.discountValue}
          onChange={(e) => setNewVoucher({...newVoucher, discountValue: Number(e.target.value)})}
          placeholder="Giá trị giảm giá"
          required
        />
        <input
          type="number"
          value={newVoucher.maxDiscount}
          onChange={(e) => setNewVoucher({...newVoucher, maxDiscount: Number(e.target.value)})}
          placeholder="Giảm giá tối đa"
        />
        <input
          type="number"
          value={newVoucher.minPurchase}
          onChange={(e) => setNewVoucher({...newVoucher, minPurchase: Number(e.target.value)})}
          placeholder="Giá trị đơn hàng tối thiểu"
          required
        />
        <input
          type="date"
          value={newVoucher.startDate}
          onChange={(e) => setNewVoucher({...newVoucher, startDate: e.target.value})}
          required
        />
        <input
          type="date"
          value={newVoucher.endDate}
          onChange={(e) => setNewVoucher({...newVoucher, endDate: e.target.value})}
          required
        />
        <input
          type="number"
          value={newVoucher.usageLimit}
          onChange={(e) => setNewVoucher({...newVoucher, usageLimit: Number(e.target.value)})}
          placeholder="Giới hạn sử dụng"
          required
        />
        <button type="submit">Tạo Voucher</button>
      </form>
      <table className={styles.voucherTable}>
        <thead>
          <tr>
            <th>Mã</th>
            <th>Loại giảm giá</th>
            <th>Giá trị</th>
            <th>Giảm giá tối đa</th>
            <th>Đơn hàng tối thiểu</th>
            <th>Ngày bắt đầu</th>
            <th>Ngày kết thúc</th>
            <th>Giới hạn sử dụng</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan="10">Đang tải...</td></tr>
          ) : error ? (
            <tr><td colSpan="10">{error}</td></tr>
          ) : vouchers.length > 0 ? (
            vouchers.map((voucher) => (
              <tr key={voucher._id}>
                <td>{voucher.code}</td>
                <td>{voucher.discountType === 'percentage' ? 'Phần trăm' : 'Cố định'}</td>
                <td>{voucher.discountValue}</td>
                <td>{voucher.maxDiscount}</td>
                <td>{voucher.minPurchase}</td>
                <td>{new Date(voucher.startDate).toLocaleDateString()}</td>
                <td>{new Date(voucher.endDate).toLocaleDateString()}</td>
                <td>{voucher.usageLimit}</td>
                <td>{voucher.isActive ? 'Hoạt động' : 'Không hoạt động'}</td>
                <td>
                  <button onClick={() => handleUpdateVoucher(voucher._id, { isActive: !voucher.isActive })}>
                    {voucher.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                  </button>
                  <button onClick={() => handleDeleteVoucher(voucher._id)}>Xóa</button>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="10">Không có voucher nào.</td></tr>
          )}
        </tbody>
      </table>
      {/* Add this debug information */}
      <div>
        <h3>Debug Info:</h3>
        <p>Vouchers count: {vouchers.length}</p>
        <p>Loading: {loading.toString()}</p>
        <p>Error: {error || 'No error'}</p>
      </div>
    </div>
  );
};

export default VoucherManagement;
