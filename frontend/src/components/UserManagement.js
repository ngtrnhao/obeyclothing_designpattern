import React, { useState, useEffect } from 'react';
import { getAdminUsers, toggleAdminUserStatus } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { FaSearch, FaSort, FaLock, FaLockOpen } from 'react-icons/fa';
import styles from './style.component/UserManagement.module.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
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
              <td>{user.role}</td>
              <td>
                <span className={`${styles.status} ${user.isActive ? styles.active : styles.inactive}`}>
                  {user.isActive ? 'Hoạt động' : 'Bị khóa'}
                </span>
              </td>
              <td>
                <button 
                  onClick={() => toggleUserStatus(user._id, user.isActive)}
                  className={`${styles.actionButton} ${user.isActive ? styles.lockButton : styles.unlockButton}`}
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