import React, { useState, useEffect } from 'react';
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from '../services/api';
import styles from './style.component/SupplierManagement.module.css';

const SupplierManagement = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [newSupplier, setNewSupplier] = useState({ name: '', contactPerson: '', email: '', phone: '', address: '' });
  const [editingSupplier, setEditingSupplier] = useState(null);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await getSuppliers();
      setSuppliers(response.data);
    } catch (error) {
      console.error('Lỗi khi tải danh sách nhà cung cấp:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editingSupplier) {
      setEditingSupplier({ ...editingSupplier, [name]: value });
    } else {
      setNewSupplier({ ...newSupplier, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSupplier) {
        await updateSupplier(editingSupplier._id, editingSupplier);
        setEditingSupplier(null);
      } else {
        await createSupplier(newSupplier);
        setNewSupplier({ name: '', contactPerson: '', email: '', phone: '', address: '' });
      }
      fetchSuppliers();
    } catch (error) {
      console.error('Lỗi khi lưu nhà cung cấp:', error);
    }
  };

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa nhà cung cấp này?')) {
      try {
        await deleteSupplier(id);
        fetchSuppliers();
      } catch (error) {
        console.error('Lỗi khi xóa nhà cung cấp:', error);
      }
    }
  };

  return (
    <div className={styles.supplierManagement}>
      <h2>Quản lý nhà cung cấp</h2>
      <form onSubmit={handleSubmit} className={styles.supplierForm}>
        <input
          type="text"
          name="name"
          value={editingSupplier ? editingSupplier.name : newSupplier.name}
          onChange={handleInputChange}
          placeholder="Tên nhà cung cấp"
          required
        />
        <input
          type="text"
          name="contactPerson"
          value={editingSupplier ? editingSupplier.contactPerson : newSupplier.contactPerson}
          onChange={handleInputChange}
          placeholder="Người liên hệ"
        />
        <input
          type="email"
          name="email"
          value={editingSupplier ? editingSupplier.email : newSupplier.email}
          onChange={handleInputChange}
          placeholder="Email"
          required
        />
        <input
          type="tel"
          name="phone"
          value={editingSupplier ? editingSupplier.phone : newSupplier.phone}
          onChange={handleInputChange}
          placeholder="Số điện thoại"
        />
        <input
          type="text"
          name="address"
          value={editingSupplier ? editingSupplier.address : newSupplier.address}
          onChange={handleInputChange}
          placeholder="Địa chỉ"
        />
        <button type="submit">{editingSupplier ? 'Cập nhật' : 'Thêm mới'}</button>
      </form>
      <table className={styles.supplierTable}>
        <thead>
          <tr>
            <th>Tên</th>
            <th>Người liên hệ</th>
            <th>Email</th>
            <th>Số điện thoại</th>
            <th>Địa chỉ</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.map((supplier) => (
            <tr key={supplier._id}>
              <td>{supplier.name}</td>
              <td>{supplier.contactPerson}</td>
              <td>{supplier.email}</td>
              <td>{supplier.phone}</td>
              <td>{supplier.address}</td>
              <td>
                <button onClick={() => handleEdit(supplier)}>Sửa</button>
                <button onClick={() => handleDelete(supplier._id)}>Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SupplierManagement;