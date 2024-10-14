import React, { useState, useEffect, useCallback } from 'react';
import Masonry from 'react-masonry-css';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaInstagram } from 'react-icons/fa';
import styles from './style.component/Lookbook.module.css';

const Lookbook = () => {
  const [looks, setLooks] = useState([]);
  const [filters, setFilters] = useState({ season: 'all', type: 'all', color: 'all' });
  const [selectedLook, setSelectedLook] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchLooks = useCallback(async () => {
    // Thay thế bằng cuộc gọi API thực tế
    const newLooks = [
      { id: 1, image: '/assets/lookbook-1.jpg', season: 'Summer', type: 'Casual', color: 'White' },
      { id: 2, image: '/assets/lookbook-2.jpg', season: 'Winter', type: 'Streetwear', color: 'Black' },
      { id: 3, image: '/assets/lookbook-3.jpg', season: 'Summer', type: 'Casual', color: 'White' },
      { id: 4, image: '/assets/lookbook-4.jpg', season: 'Winter', type: 'Streetwear', color: 'Black' },
      { id: 5, image: '/assets/lookbook-5.jpg', season: 'Summer', type: 'Casual', color: 'White' },
      { id: 6, image: '/assets/lookbook-6.jpg', season: 'Winter', type: 'Streetwear', color: 'Black' },
      // Thêm nhiều ảnh lookbook hơn
    ];
    
    // Giả lập việc tải 6 ảnh mỗi lần
    const startIndex = (page - 1) * 6;
    const endIndex = startIndex + 6;
    const pageData = newLooks.slice(startIndex, endIndex);
    
    if (pageData.length > 0) {
      setLooks(prevLooks => [...prevLooks, ...pageData]);
    } else {
      setHasMore(false);
    }
  }, [page]);

  useEffect(() => {
    fetchLooks();
  }, [fetchLooks, page]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prevFilters => ({ ...prevFilters, [filterType]: value }));
    setPage(1);
    setLooks([]);
    setHasMore(true);
  };

  const filteredLooks = looks.filter(look => 
    (filters.season === 'all' || look.season === filters.season) &&
    (filters.type === 'all' || look.type === filters.type) &&
    (filters.color === 'all' || look.color === filters.color)
  );

  const breakpointColumnsObj = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1
  };

  return (
    <div className={styles.lookbookContainer}>
      <h1 className={styles.lookbookTitle}>OBEY Lookbook</h1>
      
      <div className={styles.filterContainer}>
        <select onChange={(e) => handleFilterChange('season', e.target.value)}>
          <option value="all">All Seasons</option>
          <option value="Summer">Summer</option>
          <option value="Winter">Winter</option>
        </select>
        <select onChange={(e) => handleFilterChange('type', e.target.value)}>
          <option value="all">All Types</option>
          <option value="Casual">Casual</option>
          <option value="Streetwear">Streetwear</option>
        </select>
        <select onChange={(e) => handleFilterChange('color', e.target.value)}>
          <option value="all">All Colors</option>
          <option value="White">White</option>
          <option value="Black">Black</option>
        </select>
      </div>

      <Masonry
        breakpointCols={breakpointColumnsObj}
        className={styles.lookbookGrid}
        columnClassName={styles.lookbookGridColumn}
      >
        {filteredLooks.map(look => (
          <motion.div
            key={`${look.id}-${filters.season}-${filters.type}-${filters.color}`}
            className={styles.lookItem}
            layoutId={`look-${look.id}-${filters.season}-${filters.type}-${filters.color}`}
            onClick={() => setSelectedLook(look)}
          >
            <img src={look.image} alt={`Look ${look.id}`} className={styles.lookImage} />
            <div className={styles.lookOverlay}>
              <p>{look.season}</p>
              <p>{look.type}</p>
              <p>{look.color}</p>
            </div>
          </motion.div>
        ))}
      </Masonry>

      {hasMore && (
        <button onClick={() => setPage(prevPage => prevPage + 1)} className={styles.loadMoreButton}>
          Load More
        </button>
      )}

      <AnimatePresence>
        {selectedLook && (
          <motion.div className={styles.modalBackdrop} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className={styles.modal} layoutId={`look-${selectedLook.id}`}>
              <img src={selectedLook.image} alt={`Look ${selectedLook.id}`} className={styles.modalImage} />
              <div className={styles.modalContent}>
                <h2>Look Details</h2>
                <p>Season: {selectedLook.season}</p>
                <p>Type: {selectedLook.type}</p>
                <p>Color: {selectedLook.color}</p>
                <button className={styles.shopButton}>Shop this Look</button>
              </div>
              <button className={styles.closeButton} onClick={() => setSelectedLook(null)}>
                <FaTimes />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={styles.instagramFeed}>
        <h2><FaInstagram /> Follow us on Instagram</h2>
        {/* Thêm component Instagram Feed ở đây */}
      </div>
    </div>
  );
};

export default Lookbook;
