import React, { useState, useEffect, useCallback } from "react";
import { getProductReviews, addProductReview } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import styles from "./style.component/ProductReviews.module.css";

const ProductReviews = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getProductReviews(productId);
      console.log('Reviews data structure:', response);
      setReviews(response);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setError("Không thể tải đánh giá. Vui lòng thử lại sau.");
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      await addProductReview(productId, newReview);
      setNewReview({ rating: 5, comment: "" });
      fetchReviews();
    } catch (error) {
      console.error("Error submitting review:", error);
      setError("Không thể gửi đánh giá. Vui lòng thử lại sau.");
    }
  };

  // Thêm hàm để hiển thị sao
  const renderStars = (rating) => {
    return (
      <div className={styles.starRating}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`${styles.star} ${star > rating ? styles.emptyStar : ''}`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  // Hàm tạo avatar từ tên người dùng
  const getInitials = (name) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  // Hàm định dạng ngày giờ
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  if (loading) return <div className={styles.loading}>Đang tải đánh giá...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.reviewsSection}>
      <div className={styles.reviewsHeader}>
        <h3>Đánh giá sản phẩm</h3>
        <span className={styles.reviewCount}>
          {reviews.length} đánh giá
        </span>
      </div>

      {reviews && reviews.length > 0 ? (
        <div className={styles.reviewList}>
          {reviews.map((review) => (
            <div key={review._id} className={styles.review}>
              <div className={styles.reviewHeader}>
                <div className={styles.avatarContainer}>
                  {getInitials(review.user?.username || review.user?.fullName)}
                </div>
                <div className={styles.userInfo}>
                  <p className={styles.username}>
                    {review.user?.username || review.user?.fullName || "Người dùng ẩn danh"}
                  </p>
                  <p className={styles.reviewDate}>
                    {formatDate(review.createdAt)}
                  </p>
                </div>
              </div>
              
              {renderStars(review.rating)}
              
              <div className={styles.reviewContent}>
                {review.comment}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className={styles.noReviews}>Chưa có đánh giá nào cho sản phẩm này.</p>
      )}

      {user && (
        <form onSubmit={handleSubmitReview} className={styles.reviewForm}>
          <h4 className={styles.formTitle}>Viết đánh giá của bạn</h4>
          
          <div className={styles.ratingContainer}>
            <span className={styles.ratingLabel}>Đánh giá:</span>
            <div className={styles.ratingSelect}>
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  type="button"
                  key={num}
                  className={newReview.rating >= num ? styles.active : ''}
                  onClick={() => setNewReview({ ...newReview, rating: num })}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          
          <textarea
            value={newReview.comment}
            onChange={(e) =>
              setNewReview({ ...newReview, comment: e.target.value })
            }
            placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
            required
          />
          
          <button type="submit">Gửi đánh giá</button>
        </form>
      )}
    </div>
  );
};

export default ProductReviews;
