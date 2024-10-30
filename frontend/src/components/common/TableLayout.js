import React from 'react';
import TableControls from './TableControls';
import Pagination from './Pagination';
import styles from '../style.component/TableLayout.module.css';

const TableLayout = ({
  title,
  searchTerm,
  onSearchChange,
  filterValue,
  onFilterChange,
  filterOptions,
  children,
  currentPage,
  totalPages,
  onPageChange,
  loading,
  error,
  emptyMessage
}) => {
  if (loading) return <div className={styles.loading}>Đang tải...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.tableLayout}>
      <h2 className={styles.title}>{title}</h2>

      <div className={styles.controlsContainer}>
        <TableControls 
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          filterValue={filterValue}
          onFilterChange={onFilterChange}
          filterOptions={filterOptions}
        />
      </div>

      {children}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
};

export default TableLayout; 