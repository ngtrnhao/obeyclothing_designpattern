import React, { useState, useEffect } from 'react';
import { getUserProfile, updateUserProfile, getShippingAddresses, addShippingAddress, updateShippingAddress, deleteShippingAddress, setDefaultShippingAddress } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import styles from './style.component/UserProfile.module.css';

const UserProfile = () => {
  const { user, login } = useAuth();
  const [profile, setProfile] = useState(null);
  const [shippingAddresses, setShippingAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [updatedProfile, setUpdatedProfile] = useState({});
  const [newAddress, setNewAddress] = useState({});
  const [editingAddressId, setEditingAddressId] = useState(null);

  useEffect(() => {
    fetchUserProfile();
    fetchShippingAddresses();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await getUserProfile();
      setProfile(response.data);
      setUpdatedProfile(response.data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError('Không thể tải thông tin người dùng. Vui lòng thử lại sau.');
    }
  };

  const fetchShippingAddresses = async () => {
    try {
      const response = await getShippingAddresses();
      setShippingAddresses(response.data);
    } catch (error) {
      console.error('Error fetching shipping addresses:', error);
      setError('Không thể tải địa chỉ giao hàng. Vui lòng thử lại sau.');
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleAddressInputChange = (e) => {
    const { name, value } = e.target;
    setNewAddress(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await updateUserProfile(updatedProfile);
      setProfile(response.data);
      login(response.data);
      setEditMode(false);
      alert('Cập nhật thông tin thành công!');
    } catch (error) {
      console.error('Error updating user profile:', error);
      alert('Không thể cập nhật thông tin. Vui lòng thử lại.');
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const addressData = {
        ...newAddress,
        address: newAddress.streetAddress // Đảm bảo streetAddress được sử dụng làm địa chỉ
      };
      if (!addressData.address) {
        throw new Error('Địa chỉ đường không được để trống');
      }
      await addShippingAddress(addressData);
      fetchShippingAddresses();
      setNewAddress({
        fullName: '',
        phone: '',
        streetAddress: '',
        provinceCode: '',
        districtCode: '',
        wardCode: '',
        provinceName: '',
        districtName: '',
        wardName: ''
      });
      alert('Thêm địa chỉ mới thành công!');
    } catch (error) {
      console.error('Lỗi khi thêm địa chỉ mới:', error);
      alert(error.message || 'Không thể thêm địa chỉ mới. Vui lòng thử lại.');
    }
  };

  const handleUpdateAddress = async (e) => {
    e.preventDefault();
    try {
      await updateShippingAddress(editingAddressId, newAddress);
      fetchShippingAddresses();
      setEditingAddressId(null);
      setNewAddress({});
      alert('Cập nhật địa chỉ thành công!');
    } catch (error) {
      console.error('Error updating address:', error);
      alert('Không thể cập nhật địa chỉ. Vui lòng thử lại.');
    }
  };

  const handleDeleteAddress = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) {
      try {
        await deleteShippingAddress(id);
        fetchShippingAddresses();
        alert('Xóa địa chỉ thành công!');
      } catch (error) {
        console.error('Error deleting address:', error);
        alert('Không thể xóa địa chỉ. Vui lòng thử lại.');
      }
    }
  };

  const handleSetDefaultAddress = async (id) => {
    try {
      await setDefaultShippingAddress(id);
      fetchShippingAddresses();
      alert('Đã đặt địa chỉ mặc định thành công!');
    } catch (error) {
      console.error('Error setting default address:', error);
      alert('Không thể đặt địa chỉ mặc định. Vui lòng thử lại.');
    }
  };

  if (loading) return <div className={styles.loading}>Đang tải...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!profile) return null;

  return (
    <div className={styles.profileContainer}>
      <h2 className={styles.title}>{profile.role === 'admin' ? 'Admin Profile' : 'User Profile'}</h2>
      
      {/* User Information Section */}
      {editMode ? (
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              name="username"
              value={updatedProfile.username || ''}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={updatedProfile.email || ''}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="fullName">Full Name:</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={updatedProfile.fullName || ''}
              onChange={handleInputChange}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="phoneNumber">Phone Number:</label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={updatedProfile.phoneNumber || ''}
              onChange={handleInputChange}
            />
          </div>
          <button type="submit" className={styles.submitButton}>Save Changes</button>
          <button type="button" onClick={() => setEditMode(false)} className={styles.cancelButton}>Cancel</button>
        </form>
      ) : (
        <div className={styles.profileInfo}>
          <p><strong>Username:</strong> {profile.username}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Full Name:</strong> {profile.fullName || 'Not provided'}</p>
          <p><strong>Phone Number:</strong> {profile.phoneNumber || 'Not provided'}</p>
          {profile.role === 'admin' && <p><strong>Role:</strong> {profile.role}</p>}
          <button onClick={() => setEditMode(true)} className={styles.editButton}>Edit Profile</button>
        </div>
      )}

      {/* Shipping Addresses Section */}
      <h3 className={styles.subtitle}>Shipping Addresses</h3>
      {shippingAddresses.map(address => (
        <div key={address._id} className={styles.addressItem}>
          <p><strong>{address.fullName}</strong></p>
          <p>{address.phone}</p>
          <p>{`${address.address}, ${address.wardName}, ${address.districtName}, ${address.provinceName}`}</p>
          {address.isDefault && <p className={styles.defaultAddress}>Default Address</p>}
          <button onClick={() => handleSetDefaultAddress(address._id)} className={styles.defaultButton}>
            {address.isDefault ? 'Default' : 'Set as Default'}
          </button>
          <button onClick={() => {
            setEditingAddressId(address._id);
            setNewAddress(address);
          }} className={styles.editButton}>Edit</button>
          <button onClick={() => handleDeleteAddress(address._id)} className={styles.deleteButton}>Delete</button>
        </div>
      ))}

      {/* Add/Edit Address Form */}
      <h3 className={styles.subtitle}>{editingAddressId ? 'Edit Address' : 'Add New Address'}</h3>
      <form onSubmit={editingAddressId ? handleUpdateAddress : handleAddAddress} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="fullName">Full Name:</label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={newAddress.fullName || ''}
            onChange={handleAddressInputChange}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="phone">Phone:</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={newAddress.phone || ''}
            onChange={handleAddressInputChange}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="address">Address:</label>
          <input
            type="text"
            id="address"
            name="address"
            value={newAddress.address || ''}
            onChange={handleAddressInputChange}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="provinceName">Province:</label>
          <input
            type="text"
            id="provinceName"
            name="provinceName"
            value={newAddress.provinceName || ''}
            onChange={handleAddressInputChange}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="districtName">District:</label>
          <input
            type="text"
            id="districtName"
            name="districtName"
            value={newAddress.districtName || ''}
            onChange={handleAddressInputChange}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="wardName">Ward:</label>
          <input
            type="text"
            id="wardName"
            name="wardName"
            value={newAddress.wardName || ''}
            onChange={handleAddressInputChange}
            required
          />
        </div>
        <button type="submit" className={styles.submitButton}>
          {editingAddressId ? 'Update Address' : 'Add Address'}
        </button>
        {editingAddressId && (
          <button type="button" onClick={() => {
            setEditingAddressId(null);
            setNewAddress({});
          }} className={styles.cancelButton}>Cancel Edit</button>
        )}
      </form>
    </div>
  );
};

export default UserProfile;
