import React, { useState, useEffect } from 'react';
import { getUserProfile, updateUserProfile } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import styles from './style.component/UserProfile.module.css';

const UserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, login } = useAuth();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await getUserProfile();
      setProfile(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError('Không thể tải thông tin người dùng. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await updateUserProfile(profile);
      login(response.data); // Update the user in AuthContext
      alert('Cập nhật thông tin thành công!');
    } catch (error) {
      console.error('Error updating user profile:', error);
      alert('Có lỗi xảy ra khi cập nhật thông tin. Vui lòng thử lại.');
    }
  };

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div>{error}</div>;
  if (!profile) return <div>Không tìm thấy thông tin người dùng</div>;

  return (
    <div className={styles.userProfile}>
      <h2>Thông tin cá nhân</h2>
      <form onSubmit={handleSubmit}>
      <div className={styles.formGroup}>
          <label htmlFor="username">Tên đăng nhập:</label>
          <input
            type="text"
            id="username"
            value={profile.username}
            disabled
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={profile.email}
            onChange={(e) => setProfile({...profile, email: e.target.value})}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="fullName">Họ và tên:</label>
          <input
            type="text"
            id="fullName"
            value={profile.fullName || ''}
            onChange={(e) => setProfile({...profile, fullName: e.target.value})}
          />
        </div>
        <button type="submit" className={styles.updateButton}>Cập nhật thông tin</button>
      </form>
    </div>
  );
};

export default UserProfile;