import React, { useState } from 'react';
import { applyVoucher as applyVoucherService } from '../services/voucherService';
import { useContext } from 'react';
import { CartContext } from '../contexts/CartContext';

const VoucherInput = () => {
  const { total, cartItems, applyVoucher } = useContext(CartContext);
  const [voucherCode, setVoucherCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      setError('Vui lòng nhập mã voucher');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await applyVoucherService(voucherCode, total || 0, cartItems);
      if (result.data) {
        const finalAmount = result.data.totalAfterDiscount || (total - result.data.discountAmount);
        applyVoucher(
          result.data.voucher, 
          result.data.discountAmount,
          finalAmount
        );
        setError('');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Lỗi khi áp dụng mã giảm giá');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={voucherCode}
        onChange={(e) => setVoucherCode(e.target.value)}
        placeholder="Nhập mã giảm giá"
        disabled={loading}
      />
      <button onClick={handleApplyVoucher} disabled={loading}>
        {loading ? 'Đang áp dụng...' : 'Áp dụng'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default VoucherInput;
