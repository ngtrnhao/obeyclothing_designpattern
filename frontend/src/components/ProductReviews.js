import React, { useState, useEffect, useCallback } from 'react';
import { getProductReviews, addProductReview } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import styles from './style.component/ProductReviews.module.css';

const ProductReviews = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const { user } = useAuth();

  const fetchReviews = useCallback(async () => {
    try {
      const response = await getProductReviews(productId);
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      await addProductReview(productId, newReview);
      setNewReview({ rating: 5, comment: '' });
      fetchReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  return (
    <div className={styles.reviewsSection}>
      <h3>Đánh giá sản phẩm</h3>
      {reviews.map(review => (
        <div key={review._id} className={styles.review}>
          <p>Đánh giá: {review.rating}/5</p>
          <p>{review.comment}</p>
          <p>Bởi: {review.user.name}</p>
        </div>
      ))}
      {user && (
        <form onSubmit={handleSubmitReview} className={styles.reviewForm}>
          <select
            value={newReview.rating}
            onChange={(e) => setNewReview({ ...newReview, rating: parseInt(e.target.value) })}
          >
            {[1, 2, 3, 4, 5].map(num => (
              <option key={num} value={num}>{num}</option>
            ))}
          </select>
          <textarea
            value={newReview.comment}
            onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
            placeholder="Nhập đánh giá của bạn..."
          />
          <button type="submit">Gửi đánh giá</button>
        </form>
      )}
    </div>
  );
};

export default ProductReviews;