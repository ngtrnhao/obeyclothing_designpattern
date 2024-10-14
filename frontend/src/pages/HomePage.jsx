import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './HomePage.module.css';
import { getProducts } from '../services/api';

const imageUrl = (img) => {
  if (!img) return '/assets/placeholder-image.jpg';
  if (img.startsWith('http')) return img;
  return `${process.env.REACT_APP_API_URL}/uploads/${img}`;
};

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await getProducts(); 
      if (response && Array.isArray(response)) {
        const sortedProducts = response.sort((a, b) => b.sales - a.sales);
        setFeaturedProducts(sortedProducts.slice(0, 4));
      } else {
        console.error('Unexpected response format:', response);
        setFeaturedProducts([]);
      }
    } catch (error) {
      console.error('Error fetching featured products:', error);
      setFeaturedProducts([]);
    }
  };

  return (
    <div className={styles.homePage}>
      <section className={styles.heroSection}>
        <video autoPlay muted loop className={styles.heroVideo}>
          <source src="/assets/hiphop_banner.mp4" type="video/mp4" />
        </video>
        <div className={styles.heroOverlay}>
          <h1 className={styles.glitchSlogan}>
            <span className={styles.brand}>OBEY</span>
            <div className={styles.sloganContainer}>
              <span className={styles.sloganText}>Ôm Trọn Bản Sắc</span>
              <span className={styles.sloganText}>Yêu Thương Phong Cách</span>
            </div>
          </h1>
          <Link to="/products" className={styles.ctaButton}>Mua Sắm Ngay</Link>
        </div>
      </section>

      <section className={styles.categoriesGrid}>
        <div className={`${styles.categoryItem} ${styles.large}`}>
          <img src="/assets/1_MENS-BIGWIG.jpg" alt="Bộ Sưu Tập Nam" />
          <div className={styles.categoryOverlay}>
            <h2>Bộ Sưu Tập Nam</h2>
            <Link to="/men" className={styles.categoryLink}>Khám Phá</Link>
          </div>
        </div>
        <div className={`${styles.categoryItem} ${styles.medium}`}>
          <img src="/assets/women.jpg" alt="Bộ Sưu Tập Nữ" />
          <div className={styles.categoryOverlay}>
            <h2>Bộ Sưu Tập Nữ</h2>
            <Link to="/women" className={styles.categoryLink}>Khám Phá</Link>
          </div>
        </div>
        <div className={`${styles.categoryItem} ${styles.small}`}>
          <img src="/assets/3_PRINTABLES.jpg" alt="Áo Thun Họa Tiết" />
          <div className={styles.categoryOverlay}>
            <h2>Áo Thun Họa Tiết</h2>
            <Link to="/graphic-tees" className={styles.categoryLink}>Khám Phá</Link>
          </div>
        </div>
        <div className={`${styles.categoryItem} ${styles.small}`}>
          <img src="/assets/4_SHEPARD_COLLECTION.jpg" alt="Bộ Sưu Tập Shepard Fairey" />
          <div className={styles.categoryOverlay}>
            <h2>Bộ Sưu Tập Shepard Fairey</h2>
            <Link to="/shepard-fairey" className={styles.categoryLink}>Khám Phá</Link>
          </div>
        </div>
      </section>

      <section className={styles.featuredProducts}>
        <h2>Sản phẩm nổi bật</h2>
        <div className={styles.productGrid}>
          {featuredProducts.map((product) => (
            <div key={product._id} className={styles.productCard}>
              <div className={styles.imageContainer}>
                <img 
                  src={imageUrl(product.image)} 
                  alt={product.name} 
                  onError={(e) => {
                    e.target.onerror = null; 
                    e.target.src = '/assets/placeholder-image.jpg';
                  }}
                />
              </div>
              <h3>{product.name}</h3>
              <p>{product.price.toLocaleString('vi-VN')} đ</p>
              <Link to={`/product/${product.slug}`} className={styles.shopButton}>MUA NGAY</Link>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.aboutUs}>
        <h2>Câu chuyện của chúng tôi</h2>
        <div className={styles.storyContent}>
          <div className={styles.storyText}>
            <p>OBEY Clothing được thành lập dựa trên nghệ thuật, thiết kế và lý tưởng của Shepard Fairey. Những gì Fairey bắt đầu với một nhãn dán vô lý mà anh ấy tạo ra vào năm 1989 khi đang học tại Trường Thiết kế Rhode Island đã phát triển thành một chiến dịch nghệ thuật đường phố trên toàn thế giới, cũng như một tác phẩm nghệ thuật được ca ngợi.

Chiến dịch OBEY bắt nguồn từ phản văn hóa Do It Yourself của nhạc punk rock và trượt ván, nhưng cũng lấy cảm hứng từ văn hóa đại chúng, tiếp thị thương mại và thông điệp chính trị. Fairey thấm nhuần hệ tư tưởng và biểu tượng của mình vào sự tự trao quyền. Với sự mỉa mai sâu cay gần giống với tâm lý học ngược, anh ấy thúc giục người xem, sử dụng mệnh lệnh "tuân theo", để chú ý đến những kẻ tuyên truyền muốn bẻ cong thế giới theo chương trình nghị sự của họ.

OBEY Clothing được thành lập vào năm 2001 như một phần mở rộng của phạm vi tác phẩm của Shepard. Phù hợp với quan điểm dân túy của mình, quần áo đã trở thành một tấm vải khác để truyền bá nghệ thuật và thông điệp của ông đến mọi người. Quần áo được lấy cảm hứng rất nhiều từ thiết kế quân sự cổ điển, trang phục lao động cơ bản, cũng như các yếu tố và phong trào văn hóa mà Shepard đã dựa vào để phát triển sự nghiệp nghệ thuật của mình. Thông qua các nhà thiết kế Mike Ternosky và Erin Wignall, Shepard làm việc để tạo ra các thiết kế đại diện cho ảnh hưởng, lý tưởng và triết lý của ông.</p>
            <Link to="/about" className={styles.learnMoreButton}>Tìm hiểu thêm</Link>
          </div>
          <div className={styles.storyImage}>
            <img src="/assets/Shepard Fairey.jpg" alt="Shepard Fairey" />
          </div>
        </div>
      </section>

      <section className={styles.obeyLookbook}>
        <h2>Bộ Sưu Tập OBEY</h2>
        <div className={styles.lookbookGrid}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className={styles.lookbookItem}>
              <img src={`/assets/lookbook-${item}.jpg`} alt={`Hình ảnh bộ sưu tập ${item}`} />
            </div>
          ))}
        </div>
        <div className={styles.buttonContainer}>
          <Link to="/lookbook" className={styles.viewLookbookButton}>Xem Toàn Bộ Bộ Sưu Tập</Link>
        </div>
      </section>

      <section className={styles.obeyAwareness}>
        <h2>OBEY Vì Cộng Đồng</h2>
        <div className={styles.awarenessContent}>
          <p>OBEY Awareness là sáng kiến của chúng tôi nhằm nâng cao nhận thức về các vấn đề xã hội và môi trường quan trọng thông qua nghệ thuật và thời trang.</p>
          <Link to="/awareness" className={styles.exploreButton}>Khám phá các dự án</Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;