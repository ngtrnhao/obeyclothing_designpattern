import React, { useState, useEffect } from 'react';
import { getUserProfile, updateUserProfile, getShippingAddresses, addShippingAddress, updateShippingAddress, deleteShippingAddress, setDefaultShippingAddress } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import styles from './style.component/UserProfile.module.css';
import { provinces, getDistricts, getWards } from '../data/vietnamData';

const UserProfile = () => {
  const { login } = useAuth();
  const [profile, setProfile] = useState(null);
  const [shippingAddresses, setShippingAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [updatedProfile, setUpdatedProfile] = useState({});
  const [newAddress, setNewAddress] = useState({
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
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

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
    const updatedAddress = { ...newAddress };

    if (name === 'provinceCode') {
      const selectedProvince = provinces.find(p => p.code === value);
      updatedAddress.provinceCode = value;
      updatedAddress.provinceName = selectedProvince ? selectedProvince.name : '';
      updatedAddress.districtCode = '';
      updatedAddress.districtName = '';
      updatedAddress.wardCode = '';
      updatedAddress.wardName = '';
      
      const newDistricts = getDistricts(value);
      setDistricts(newDistricts);
      setWards([]);
    } else if (name === 'districtCode') {
      const selectedDistrict = districts.find(d => d.code === value);
      updatedAddress.districtCode = value;
      updatedAddress.districtName = selectedDistrict ? selectedDistrict.name : '';
      updatedAddress.wardCode = '';
      updatedAddress.wardName = '';
      
      const newWards = getWards(updatedAddress.provinceCode, value);
      setWards(newWards);
    } else if (name === 'wardCode') {
      const selectedWard = wards.find(w => w.code === value);
      updatedAddress.wardCode = value;
      updatedAddress.wardName = selectedWard ? selectedWard.name : '';
    } else {
      updatedAddress[name] = value;
    }

    setNewAddress(updatedAddress);
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
      if (!newAddress.fullName || !newAddress.phone || !newAddress.streetAddress || 
          !newAddress.provinceCode || !newAddress.districtCode || !newAddress.wardCode) {
        throw new Error('Vui lòng điền đầy đủ thông tin địa chỉ');
      }

      const addressData = {
        fullName: newAddress.fullName,
        phone: newAddress.phone,
        streetAddress: newAddress.streetAddress,
        provinceCode: newAddress.provinceCode,
        provinceName: newAddress.provinceName,
        districtCode: newAddress.districtCode,
        districtName: newAddress.districtName,
        wardCode: newAddress.wardCode,
        wardName: newAddress.wardName
      };

      await addShippingAddress(addressData);
      await fetchShippingAddresses();
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

      {/* Updated Shipping Addresses Section */}
      <h3 className={styles.subtitle}>Địa chỉ giao hàng</h3>
      <div className={styles.addressList}>
        {shippingAddresses.map(address => (
          <div key={address._id} className={styles.addressCard}>
            <div className={styles.addressContent}>
              <div className={styles.addressHeader}>
                <h3>{address.fullName}</h3>
                {address.isDefault && <span className={styles.defaultBadge}>Mặc định</span>}
              </div>
              <p className={styles.phone}>{address.phone}</p>
              <p className={styles.address}>
                {address.streetAddress}, {address.wardName}, 
                {address.districtName}, {address.provinceName}
              </p>
            </div>
            <div className={styles.addressActions}>
              <button 
                onClick={() => handleSetDefaultAddress(address._id)}
                className={`${styles.actionButton} ${address.isDefault ? styles.defaultButton : ''}`}
              >
                {address.isDefault ? 'Địa chỉ mặc định' : 'Đặt làm mặc định'}
              </button>
              <button 
                onClick={() => {
                  setEditingAddressId(address._id);
                  setNewAddress(address);
                }} 
                className={styles.editButton}
              >
                Sửa
              </button>
              <button 
                onClick={() => handleDeleteAddress(address._id)} 
                className={styles.deleteButton}
              >
                Xóa
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Updated Add/Edit Address Form */}
      <h3 className={styles.subtitle}>{editingAddressId ? 'Sửa địa chỉ' : 'Thêm địa chỉ mới'}</h3>
      <form onSubmit={editingAddressId ? handleUpdateAddress : handleAddAddress} className={styles.addressForm}>
        <div className={styles.formGroup}>
          <label htmlFor="fullName">Họ và tên:</label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={newAddress.fullName}
            onChange={handleAddressInputChange}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="phone">Số điện thoại:</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={newAddress.phone}
            onChange={handleAddressInputChange}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="streetAddress">Địa chỉ:</label>
          <input
            type="text"
            id="streetAddress"
            name="streetAddress"
            value={newAddress.streetAddress}
            onChange={handleAddressInputChange}
            placeholder="Số nhà, tên đường"
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="provinceCode">Tỉnh/Thành phố:</label>
          <select
            id="provinceCode"
            name="provinceCode"
            value={newAddress.provinceCode}
            onChange={handleAddressInputChange}
            required
          >
            <option value="">Chọn Tỉnh/Thành phố</option>
            {provinces.map(province => (
              <option key={province.code} value={province.code}>
                {province.name}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="districtCode">Quận/Huyện:</label>
          <select
            id="districtCode"
            name="districtCode"
            value={newAddress.districtCode}
            onChange={handleAddressInputChange}
            required
            disabled={!newAddress.provinceCode}
          >
            <option value="">Chọn Quận/Huyện</option>
            {districts.map(district => (
              <option key={district.code} value={district.code}>
                {district.name}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="wardCode">Phường/Xã:</label>
          <select
            id="wardCode"
            name="wardCode"
            value={newAddress.wardCode}
            onChange={handleAddressInputChange}
            required
            disabled={!newAddress.districtCode}
          >
            <option value="">Chọn Phường/Xã</option>
            {wards.map(ward => (
              <option key={ward.code} value={ward.code}>
                {ward.name}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.formActions}>
          <button type="submit" className={styles.submitButton}>
            {editingAddressId ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ'}
          </button>
          {editingAddressId && (
            <button
              type="button"
              onClick={() => {
                setEditingAddressId(null);
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
              }}
              className={styles.cancelButton}
            >
              Hủy
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default UserProfile;
