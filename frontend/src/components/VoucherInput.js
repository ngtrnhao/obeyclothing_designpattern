import React, { useState } from 'react';
import { applyVoucher as applyVoucherService } from '../services/voucherService';
import { useContext } from 'react';
import { CartContext } from '../contexts/CartContext';
import styles from './style.component/Cart.module.css';

const VoucherInput = () => {
  const { total, cartItems, applyVoucher } = useContext(CartContext);
  const [voucherCode, setVoucherCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [remainingUses, setRemainingUses] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      setError('Vui lòng nhập mã voucher');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');
    setRemainingUses(null);

    try {
      const result = await applyVoucherService(voucherCode, total || 0, cartItems);
      if (result.data) {
        const finalAmount = result.data.totalAfterDiscount || (total - result.data.discountAmount);
        applyVoucher(
          result.data.voucher, 
          result.data.discountAmount,
          finalAmount
        );
        setRemainingUses(result.data.remainingUses);
        setSuccessMessage('Áp dụng mã giảm giá thành công');
        setVoucherCode(''); // Reset input sau khi áp dụng thành công
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Lỗi khi áp dụng mã giảm giá');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.voucherSection}>
      <input
        type="text"
        value={voucherCode}
        onChange={(e) => setVoucherCode(e.target.value)}
        placeholder="Nhập mã giảm giá"
        className={styles.voucherInput}
      />
      <button 
        onClick={handleApplyVoucher}
        disabled={loading || !voucherCode.trim()}
        className={styles.applyButton}
      >
        {loading ? 'Đang áp dụng...' : 'Áp dụng'}
      </button>
      {error && <p className={styles.errorMessage}>{error}</p>}
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
      {remainingUses !== null && (
        <p style={{ color: 'blue' }}>
          Còn lại {remainingUses} lượt sử dụng
        </p>
      )}
    </div>
  );
};

export default VoucherInput;
