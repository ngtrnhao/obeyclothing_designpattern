import React, { useState, useEffect } from 'react';
import { getAdminUsers, toggleAdminUserStatus, changeUserRole } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { FaSearch, FaSort, FaLock, FaLockOpen } from 'react-icons/fa';
import styles from './style.component/UserManagement.module.css';
import { toast } from 'react-toastify';

const StatusBadge = ({ isActive, isLocked }) => {
  const getStatusInfo = () => {
    if (!isActive) {
      return {
        text: 'Bị khóa',
        className: styles.statusInactive
      };
    } 
    if (isLocked) {
      return {
        text: 'Tạm khóa',
        className: styles.statusLocked
      };
    }
    return {
      text: 'Hoạt động',
      className: styles.statusActive
    };
  };

  const { text, className } = getStatusInfo();

  return (
    <span className={`${styles.statusBadge} ${className}`}>
      {text}
    </span>
  );
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const { user, user: currentUser } = useAuth();

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
      const response = await toggleAdminUserStatus(userId, !isActive);
      if (response && response.data) {
        await fetchUsers();
        return response.data;
      }
      throw new Error('Không nhận được phản hồi từ server');
    } catch (error) {
      console.error('Error toggling user status:', error);
      throw error;
    }
  };

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedUsers = React.useMemo(() => {
    let sortableUsers = [...users];
    if (sortConfig.key !== null) {
      sortableUsers.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableUsers;
  }, [users, sortConfig]);

  const filteredUsers = sortedUsers.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await changeUserRole(userId, newRole);
      fetchUsers(); // Tải lại danh sách người dùng
      alert('Thay đổi vai trò người dùng thành công');
    } catch (error) {
      console.error('Error changing user role:', error);
      alert('Không thể thay đổi vai trò người dùng. Vui lòng thử lại sau.');
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      const result = await toggleUserStatus(userId, currentStatus);
      setUsers(users.map(user => 
        user._id === userId 
          ? { ...user, isActive: !currentStatus }
          : user
      ));
      toast.success(result.message || 'Thay đổi trạng thái người dùng thành công');
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi thay đổi trạng thái người dùng';
      toast.error(errorMessage);
      console.error('Error toggling user status:', error);
    }
  };

  if (loading) return <div className={styles.loading}>Đang tải...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.userManagement}>
      <h2>Quản lý người dùng</h2>
      <div className={styles.searchBar}>
        <FaSearch />
        <input
          type="text"
          placeholder="Tìm kiếm theo tên, email hoặc vai trò"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <table className={styles.userTable}>
        <thead>
          <tr>
            <th onClick={() => handleSort('username')}>Tên <FaSort /></th>
            <th onClick={() => handleSort('email')}>Email <FaSort /></th>
            <th onClick={() => handleSort('role')}>Vai trò <FaSort /></th>
            <th onClick={() => handleSort('isActive')}>Trạng thái <FaSort /></th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {currentUsers.map(user => (
            <tr key={user._id}>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>
                <select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user._id, e.target.value)}
                  className={styles.roleSelect}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
              <td>
                <StatusBadge isActive={user.isActive} isLocked={user.isLocked} />
              </td>
              <td>
                <button 
                  onClick={() => handleToggleStatus(user._id, user.isActive)}
                  className={`${styles.actionButton} ${user.isActive ? styles.lockButton : styles.unlockButton}`}
                  disabled={user._id === currentUser?._id}
                  title={user._id === currentUser?._id ? 'Không thể khóa tài khoản của chính mình' : ''}
                >
                  {user.isActive ? <FaLock /> : <FaLockOpen />}
                  {user.isActive ? 'Khóa' : 'Mở khóa'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className={styles.pagination}>
        {Array.from({ length: Math.ceil(filteredUsers.length / usersPerPage) }, (_, i) => (
          <button key={i} onClick={() => paginate(i + 1)} className={currentPage === i + 1 ? styles.active : ''}>
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default UserManagement;