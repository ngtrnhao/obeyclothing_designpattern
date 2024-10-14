import api from './api';

export const getVouchers = () => api.get('/admin/vouchers');
export const createVoucher = (voucherData) => api.post('/admin/vouchers', voucherData);
export const updateVoucher = (id, voucherData) => api.put(`/admin/vouchers/${id}`, voucherData);
export const deleteVoucher = (id) => api.delete(`/admin/vouchers/${id}`);

// Thêm hàm applyVoucher
export const applyVoucher = (code, totalAmount, cartItems) => api.post('/api/vouchers/apply', { code, totalAmount, cartItems });
