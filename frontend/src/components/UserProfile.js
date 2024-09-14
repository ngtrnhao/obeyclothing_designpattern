import React, { useState, useEffect } from 'react';
import { getUserProfile, updateUserProfile } from '../services/api';
import styles from './style.component/UserProfile.module.css';

const UserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await getUserProfile();
      setProfile(response.data);
    } catch (error) {
      setError('Không thể tải thông tin cá nhân. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await updateUserProfile(profile);
      alert('Cập nhật thông tin thành công!');
    } catch (error) {
      setError('Không thể cập nhật thông tin. Vui lòng thử lại.');
    }
  };

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div>{error}</div>;
  if (!profile) return <div>Không tìm thấy thông tin cá nhân</div>;

  return (
    <div className={styles.userProfile}>
      <h2>Thông tin cá nhân</h2>
      <form onSubmit={handleUpdateProfile}>
        <div className={styles.formGroup}>
          <label>Tên:</label>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Email:</label>
          <input type="email" value={profile.email} disabled />
        </div>
        <div className={styles.formGroup}>
          <label>Số điện thoại:</label>
          <input
            type="tel"
            value={profile.phone}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Địa chỉ:</label>
          <textarea
            value={profile.address}
            onChange={(e) => setProfile({ ...profile, address: e.target.value })}
          />
        </div>
        <button type="submit" className={styles.updateButton}>Cập nhật thông tin</button>
      </form>
    </div>
  );
};

export default UserProfile;