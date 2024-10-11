import React, { useState } from 'react';
import { applyVoucher } from '../services/voucherService';

const VoucherInput = ({ onApplyVoucher }) => {
  const [voucherCode, setVoucherCode] = useState('');
  const [error, setError] = useState('');

  const handleApplyVoucher = async () => {
    try {
      // Giả sử bạn có một cách để lấy tổng số tiền của giỏ hàng
      const totalAmount = 0; // Thay thế bằng logic thực tế để lấy tổng số tiền
      const result = await applyVoucher(voucherCode, totalAmount);
      onApplyVoucher(result.discountAmount, result.totalAfterDiscount);
      setError('');
    } catch (error) {
      setError(error.response?.data?.message || 'Lỗi khi áp dụng mã giảm giá');
    }
  };

  return (
    <div>
      <input
        type="text"
        value={voucherCode}
        onChange={(e) => setVoucherCode(e.target.value)}
        placeholder="Nhập mã giảm giá"
      />
      <button onClick={handleApplyVoucher}>Áp dụng</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default VoucherInput;