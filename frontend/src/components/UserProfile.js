import React, { useState, useEffect } from 'react';
import { getUserProfile, updateUserProfile } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import styles from './style.component/UserProfile.module.css';

const UserProfile = () => {
  const { user, login } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [updatedProfile, setUpdatedProfile] = useState({});

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await getUserProfile();
      setProfile(response.data);
      setUpdatedProfile(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError('Không thể tải thông tin người dùng. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await updateUserProfile(updatedProfile);
      setProfile(response.data);
      login(response.data); // Update user in AuthContext
      setEditMode(false);
      alert('Cập nhật thông tin thành công!');
    } catch (error) {
      console.error('Error updating user profile:', error);
      alert('Không thể cập nhật thông tin. Vui lòng thử lại.');
    }
  };

  if (loading) return <div className={styles.loading}>Đang tải...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!profile) return null;

  return (
    <div className={styles.profileContainer}>
      <h2 className={styles.title}>{profile.role === 'admin' ? 'Admin Profile' : 'User Profile'}</h2>
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
          <div className={styles.formGroup}>
            <label htmlFor="address">Address:</label>
            <textarea
              id="address"
              name="address"
              value={updatedProfile.address || ''}
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
          <p><strong>Address:</strong> {profile.address || 'Not provided'}</p>
          {profile.role === 'admin' && <p><strong>Role:</strong> {profile.role}</p>}
          <button onClick={() => setEditMode(true)} className={styles.editButton}>Edit Profile</button>
        </div>
      )}
    </div>
  );
};

export default UserProfile;