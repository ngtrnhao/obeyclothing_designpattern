import React, { useState } from 'react';
import { applyVoucher } from '../services/voucherService';

const VoucherInput = ({ onApplyVoucher, totalAmount, cartItems }) => {
  const [voucherCode, setVoucherCode] = useState('');
  const [error, setError] = useState('');

  const handleApplyVoucher = async () => {
    try {
      const result = await applyVoucher(voucherCode, totalAmount, cartItems);
      onApplyVoucher(result.data.discountAmount, result.data.totalAfterDiscount);
      setError('');
    } catch (error) {
      console.error('Lỗi khi áp dụng voucher:', error);
      setError(error.response?.data?.message || 'Lỗi khi áp dụng mã giảm giá. Vui lòng thử lại.');
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
