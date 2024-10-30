import { useState, useMemo } from 'react';

const useTableControls = (initialData, options = {}) => {
  const {
    itemsPerPage = 10,
    searchFields = [],
    defaultSort = null,
    filterField = 'status'
  } = options;

  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState(defaultSort || { key: null, direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterValue, setFilterValue] = useState('all');

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const filteredAndSortedItems = useMemo(() => {
    let result = [...initialData];

    // Tìm kiếm
    if (searchTerm && searchFields.length > 0) {
      result = result.filter(item => {
        return searchFields.some(field => {
          const value = field.split('.').reduce((obj, key) => obj?.[key], item);
          return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
        });
      });
    }

    // Lọc
    if (filterValue !== 'all') {
      result = result.filter(item => {
        const value = filterField.split('.').reduce((obj, key) => obj?.[key], item);
        return value === filterValue;
      });
    }

    // Sắp xếp
    if (sortConfig.key) {
      result.sort((a, b) => {
        const aValue = sortConfig.key.split('.').reduce((obj, key) => obj?.[key], a);
        const bValue = sortConfig.key.split('.').reduce((obj, key) => obj?.[key], b);
        
        if (!aValue) return 1;
        if (!bValue) return -1;
        
        return sortConfig.direction === 'asc' 
          ? aValue > bValue ? 1 : -1
          : aValue < bValue ? 1 : -1;
      });
    }

    return result;
  }, [initialData, searchTerm, filterValue, sortConfig, searchFields, filterField]);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedItems.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedItems, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedItems.length / itemsPerPage);

  return {
    currentPage,
    setCurrentPage,
    sortConfig,
    handleSort,
    searchTerm,
    setSearchTerm,
    filterValue,
    setFilterValue,
    paginatedItems,
    totalPages
  };
};

export default useTableControls;
