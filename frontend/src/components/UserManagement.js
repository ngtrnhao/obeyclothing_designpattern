import React, { useState, useEffect } from 'react';
import { getAdminUsers, toggleAdminUserStatus } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import styles from './style.component/UserManagement.module.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getAdminUsers();
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Không thể tải danh sách người dùng. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId, isActive) => {
    try {
      await toggleAdminUserStatus(userId, !isActive);
      fetchUsers();
    } catch (error) {
      console.error('Error toggling user status:', error);
      setError('Không thể thay đổi trạng thái người dùng. Vui lòng thử lại sau.');
    }
  };

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.userManagement}>
      <h2>Quản lý người dùng</h2>
      <table className={styles.userTable}>
        <thead>
          <tr>
            <th>Tên</th>
            <th>Email</th>
            <th>Vai trò</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id}>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>{user.isActive ? 'Hoạt động' : 'Bị khóa'}</td>
              <td>
                <button onClick={() => toggleUserStatus(user._id, user.isActive)}>
                  {user.isActive ? 'Khóa' : 'Mở khóa'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagement;