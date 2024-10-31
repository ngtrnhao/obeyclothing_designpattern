import React from 'react';
import styles from './AboutPage.module.css';

const AboutPage = () => {
  return (
    <div className={styles.aboutContainer}>
      <section className={styles.heroSection}>
        <h1>Câu Chuyện OBEY</h1>
        <div className={styles.heroImage}>
          <img src="/assets/obey-sightings-feature.jpg" alt="OBEY Brand Story" />
        </div>
      </section>

      <section className={styles.brandStory}>
        <div className={styles.storyContent}>
          <h2>Nguồn Gốc & Di Sản</h2>
          <p>
            OBEY Clothing được thành lập bởi nghệ sĩ đường phố Shepard Fairey vào năm 2001, 
            như một phần mở rộng của tác phẩm nghệ thuật đường phố nổi tiếng của ông. 
            Thương hiệu kết hợp các yếu tố của nghệ thuật đường phố, văn hóa punk rock, 
            skateboarding và các phong trào phản kháng vào thiết kế thời trang.
          </p>
        </div>
      </section>

      <section className={styles.valuesSection}>
        <h2>Giá Trị Cốt Lõi</h2>
        <div className={styles.valuesGrid}>
          <div className={styles.valueCard}>
            <h3>Nghệ Thuật</h3>
            <p>Mỗi thiết kế là một tác phẩm nghệ thuật, phản ánh tinh thần sáng tạo và độc đáo</p>
          </div>
          <div className={styles.valueCard}>
            <h3>Phản Kháng</h3>
            <p>Thách thức quy ước, thúc đẩy tư duy độc lập và biểu đạt cá nhân</p>
          </div>
          <div className={styles.valueCard}>
            <h3>Bền Vững</h3>
            <p>Cam kết với các phương pháp sản xuất có trách nhiệm và bảo vệ môi trường</p>
          </div>
        </div>
      </section>

      <section className={styles.timelineSection}>
        <h2>Hành Trình Phát Triển</h2>
        <div className={styles.timeline}>
          <div className={styles.timelineItem}>
            <h3>1989</h3>
            <p>Shepard Fairey bắt đầu chiến dịch nghệ thuật đường phố OBEY Giant</p>
          </div>
          <div className={styles.timelineItem}>
            <h3>2001</h3>
            <p>OBEY Clothing chính thức ra mắt</p>
          </div>
          <div className={styles.timelineItem}>
            <h3>Hiện Tại</h3>
            <p>Phát triển thành thương hiệu thời trang street style toàn cầu</p>
          </div>
        </div>
      </section>

      <section className={styles.visionSection}>
        <div className={styles.visionGrid}>
          <div className={styles.visionImage}>
            <img src="/assets/vision-image.jpg" alt="OBEY Vision" />
          </div>
          <div className={styles.visionContent}>
            <h2>TẦM NHÌN CỦA CHÚNG TÔI</h2>
            <p>Định hình văn hóa đường phố thông qua nghệ thuật và thời trang...</p>
          </div>
        </div>
      </section>

      <section className={styles.teamSection}>
        <h2>ĐỘI NGŨ SÁNG TẠO</h2>
        <div className={styles.teamGrid}>
          <div className={styles.teamMember}>
            <img src="/assets/team/shepard-fairey.jpg" alt="Shepard Fairey" />
            <h3>Shepard Fairey</h3>
            <p>Founder & Creative Director</p>
          </div>
          {/* Thêm các thành viên khác */}
        </div>
      </section>

      <section className={styles.impactSection}>
        <div className={styles.impactStats}>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>20+</span>
            <p>Năm Kinh Nghiệm</p>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>50+</span>
            <p>Quốc Gia</p>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>1M+</span>
            <p>Sản Phẩm Bán Ra</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage; 