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
  
  // Thêm state quản lý lỗi
  const [formErrors, setFormErrors] = useState({
    code: '',
    discountValue: '',
    minPurchase: '',
    startDate: '',
    endDate: '',
    usageLimit: '',
    general: ''
  });

  useEffect(() => {
    fetchVouchers();
  }, []);

  useEffect(() => {
    console.log('Current vouchers:', vouchers);
  }, [vouchers]);

  const fetchVouchers = async () => {
    console.log('Đang lấy danh sách voucher');
    try {
      setLoading(true);
      const response = await getVouchers();
      console.log('Dữ liệu voucher nhận được:', response);
      
      if (response && response.data && Array.isArray(response.data)) {
        // Format dữ liệu trước khi cập nhật state
        const formattedVouchers = response.data.map(voucher => ({
          ...voucher,
          startDate: new Date(voucher.startDate).toLocaleDateString(),
          endDate: new Date(voucher.endDate).toLocaleDateString(),
          discountType: voucher.discountType === 'percentage' ? 'Phần trăm' : 'Cố định',
          isActive: voucher.isActive ? 'Hoạt động' : 'Không hoạt động'
        }));
        
        setVouchers(formattedVouchers);
        console.log('Đã cập nhật state vouchers:', formattedVouchers);
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

  // Hàm kiểm tra form hợp lệ
  const validateForm = () => {
    let errors = {
      code: '',
      discountValue: '',
      minPurchase: '',
      startDate: '',
      endDate: '',
      usageLimit: '',
      general: ''
    };
    let isValid = true;

    // Kiểm tra mã voucher
    if (!newVoucher.code.trim()) {
      errors.code = 'Vui lòng nhập mã voucher';
      isValid = false;
    } else if (newVoucher.code.length < 3) {
      errors.code = 'Mã voucher phải có ít nhất 3 ký tự';
      isValid = false;
    }

    // Kiểm tra giá trị giảm giá
    if (newVoucher.discountValue <= 0) {
      errors.discountValue = 'Giá trị giảm giá phải lớn hơn 0';
      isValid = false;
    } else if (newVoucher.discountType === 'percentage' && newVoucher.discountValue > 100) {
      errors.discountValue = 'Giảm giá phần trăm không thể vượt quá 100%';
      isValid = false;
    }

    // Kiểm tra giá trị đơn hàng tối thiểu
    if (newVoucher.minPurchase < 0) {
      errors.minPurchase = 'Giá trị đơn hàng tối thiểu không được âm';
      isValid = false;
    }

    // Kiểm tra ngày bắt đầu
    if (!newVoucher.startDate) {
      errors.startDate = 'Vui lòng chọn ngày bắt đầu';
      isValid = false;
    }

    // Kiểm tra ngày kết thúc
    if (!newVoucher.endDate) {
      errors.endDate = 'Vui lòng chọn ngày kết thúc';
      isValid = false;
    } else if (new Date(newVoucher.endDate) <= new Date(newVoucher.startDate)) {
      errors.endDate = 'Ngày kết thúc phải sau ngày bắt đầu';
      isValid = false;
    }

    // Kiểm tra giới hạn sử dụng
    if (newVoucher.usageLimit <= 0) {
      errors.usageLimit = 'Giới hạn sử dụng phải lớn hơn 0';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleCreateVoucher = async (e) => {
    e.preventDefault();
    console.log('Đang tạo voucher mới:', newVoucher);
    
    // Kiểm tra form trước khi gửi
    if (!validateForm()) {
      setFormErrors(prev => ({
        ...prev,
        general: 'Vui lòng kiểm tra lại thông tin nhập liệu'
      }));
      return;
    }
    
    try {
      // Gọi API tạo voucher
      const response = await createVoucher(newVoucher);
      console.log('Response từ server:', response);
      
      // Đảm bảo response.data có đầy đủ thông tin
      const createdVoucher = response.data;
      
      // Cập nhật state với dữ liệu đầy đủ
      setVouchers(prevVouchers => {
        // Chuyển đổi ngày thành định dạng phù hợp
        const formattedVoucher = {
          ...createdVoucher,
          startDate: new Date(createdVoucher.startDate).toLocaleDateString(),
          endDate: new Date(createdVoucher.endDate).toLocaleDateString(),
          // Đảm bảo các trường khác được định dạng đúng
          discountType: createdVoucher.discountType === 'percentage' ? 'Phần trăm' : 'Cố định',
          isActive: createdVoucher.isActive ? 'Hoạt động' : 'Không hoạt động'
        };
        
        console.log('Voucher đã được format:', formattedVoucher);
        return [...prevVouchers, formattedVoucher];
      });

      // Reset form và lỗi
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
      setFormErrors({
        code: '',
        discountValue: '',
        minPurchase: '',
        startDate: '',
        endDate: '',
        usageLimit: '',
        general: ''
      });
      
      // Gọi lại API để lấy danh sách mới nhất
      await fetchVouchers();

    } catch (error) {
      console.error('Lỗi khi tạo voucher:', error);
      
      // Xử lý lỗi từ API
      if (error.response && error.response.data && error.response.data.message) {
        setFormErrors(prev => ({
          ...prev,
          general: error.response.data.message
        }));
      } else {
        setFormErrors(prev => ({
          ...prev,
          general: 'Không thể tạo voucher. Vui lòng thử lại sau.'
        }));
      }
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
      
      {/* Hiển thị lỗi chung nếu có */}
      {formErrors.general && <div className={styles.errorMessage}>{formErrors.general}</div>}
      
      <form onSubmit={handleCreateVoucher} className={styles.voucherForm}>
        <div className={styles.formGroup}>
          <input
            type="text"
            value={newVoucher.code}
            onChange={(e) => setNewVoucher({...newVoucher, code: e.target.value})}
            placeholder="Mã voucher"
            className={formErrors.code ? styles.inputError : ''}
          />
          {formErrors.code && <div className={styles.errorText}>{formErrors.code}</div>}
        </div>
        
        <div className={styles.formGroup}>
          <select
            value={newVoucher.discountType}
            onChange={(e) => setNewVoucher({...newVoucher, discountType: e.target.value})}
          >
            <option value="percentage">Phần trăm</option>
            <option value="fixed">Số tiền cố định</option>
          </select>
        </div>
        
        <div className={styles.formGroup}>
          <input
            type="number"
            value={newVoucher.discountValue}
            onChange={(e) => setNewVoucher({...newVoucher, discountValue: Number(e.target.value)})}
            placeholder="Giá trị giảm giá"
            className={formErrors.discountValue ? styles.inputError : ''}
          />
          {formErrors.discountValue && <div className={styles.errorText}>{formErrors.discountValue}</div>}
        </div>
        
        <div className={styles.formGroup}>
          <input
            type="number"
            value={newVoucher.maxDiscount}
            onChange={(e) => setNewVoucher({...newVoucher, maxDiscount: Number(e.target.value)})}
            placeholder="Giảm giá tối đa"
          />
        </div>
        
        <div className={styles.formGroup}>
          <input
            type="number"
            value={newVoucher.minPurchase}
            onChange={(e) => setNewVoucher({...newVoucher, minPurchase: Number(e.target.value)})}
            placeholder="Giá trị đơn hàng tối thiểu"
            className={formErrors.minPurchase ? styles.inputError : ''}
          />
          {formErrors.minPurchase && <div className={styles.errorText}>{formErrors.minPurchase}</div>}
        </div>
        
        <div className={styles.formGroup}>
          <input
            type="date"
            value={newVoucher.startDate}
            onChange={(e) => setNewVoucher({...newVoucher, startDate: e.target.value})}
            className={formErrors.startDate ? styles.inputError : ''}
          />
          {formErrors.startDate && <div className={styles.errorText}>{formErrors.startDate}</div>}
        </div>
        
        <div className={styles.formGroup}>
          <input
            type="date"
            value={newVoucher.endDate}
            onChange={(e) => setNewVoucher({...newVoucher, endDate: e.target.value})}
            className={formErrors.endDate ? styles.inputError : ''}
          />
          {formErrors.endDate && <div className={styles.errorText}>{formErrors.endDate}</div>}
        </div>
        
        <div className={styles.formGroup}>
          <input
            type="number"
            value={newVoucher.usageLimit}
            onChange={(e) => setNewVoucher({...newVoucher, usageLimit: Number(e.target.value)})}
            placeholder="Giới hạn sử dụng"
            className={formErrors.usageLimit ? styles.inputError : ''}
          />
          {formErrors.usageLimit && <div className={styles.errorText}>{formErrors.usageLimit}</div>}
        </div>
        
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
            <th>Đã sử dụng</th>
            <th>Giới hạn sử dụng</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {vouchers.map((voucher) => (
            <tr key={voucher._id}>
              <td>{voucher.code}</td>
              <td>{voucher.discountType === 'percentage' ? 'Phần trăm' : 'Cố định'}</td>
              <td>{voucher.discountValue}</td>
              <td>{voucher.maxDiscount}</td>
              <td>{voucher.minPurchase}</td>
              <td>{new Date(voucher.startDate).toLocaleDateString()}</td>
              <td>{new Date(voucher.endDate).toLocaleDateString()}</td>
              <td>{voucher.usedCount || 0}</td>
              <td>{voucher.usageLimit}</td>
              <td>
                {voucher.isActive ? 
                  <span style={{ color: 'green' }}>Hoạt động</span> : 
                  <span style={{ color: 'red' }}>Không hoạt động</span>
                }
              </td>
              <td>
                <button 
                  onClick={() => handleUpdateVoucher(voucher._id, { isActive: !voucher.isActive })}
                  className={voucher.isActive ? styles.deactivateBtn : styles.activateBtn}
                  disabled={voucher.usedCount >= voucher.usageLimit}
                >
                  {voucher.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                </button>
                <button 
                  onClick={() => handleDeleteVoucher(voucher._id)}
                  className={styles.deleteBtn}
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VoucherManagement;
