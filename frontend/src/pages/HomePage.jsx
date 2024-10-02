import React from 'react';
import { Link } from 'react-router-dom';
import styles from './HomePage.module.css';

const HomePage = () => {
  return (
    <div className={styles.homePage}>
      <div className={styles.heroSection}>
        <div className={styles.heroImageContainer}>
          <img src="/assets/men.jpg" alt="Men's New Arrivals" className={styles.heroImage} />
          <span className={styles.heroText}>MENS NEW ARRIVALS</span>
        </div>
        <div className={styles.heroImageContainer}>
          <img src="/assets/women.jpg" alt="Women's New Arrivals" className={styles.heroImage} />
          <span className={styles.heroText}>WOMENS NEW ARRIVALS</span>
        </div>
      </div>
      <div className={styles.additionalImages}>
        <div className={styles.imageWithText}>
          <img src="/assets/3_PRINTABLES.jpg" alt="Men's Graphic T's" className={styles.additionalImage} />
          <span className={styles.imageText}>MENS GRAPHIC T'S</span>
        </div>
        <div className={styles.imageWithText}>
          <img src="/assets/4_SHEPARD_COLLECTION.jpg" alt="Shepard Fairey Collection" className={styles.additionalImage} />
          <span className={styles.imageText}>SHEPARD FAIREY COLLECTION</span>
        </div>
      </div>
      <div className={styles.fourImages}>
        <div className={styles.imageWithText}>
          <img src="/assets/HOMEPAGE_FOOTER_LOOKBOOK-–-1.jpg" alt="Lookbook" className={styles.smallImage} />
          <span className={styles.imageText}>LOOKBOOK</span>
        </div>
        <div className={styles.imageWithText}>
          <img src="/assets/HOMEPAGE_FOOTER_NEWS-–-3.jpg" alt="News" className={styles.smallImage} />
          <span className={styles.imageText}>NEWS</span>
        </div>
        <div className={styles.imageWithText}>
          <img src="/assets/HOMEPAGE_FOOTER_RECORDS-–-2.jpg" alt="Obey Records" className={styles.smallImage} />
          <span className={styles.imageText}>OBEY RECORDS</span>
        </div>
        <div className={styles.imageWithText}>
          <img src="/assets/HOMEPAGE_FOOTER_AWARENESS-–-4.jpg" alt="Awareness" className={styles.smallImage} />
          <span className={styles.imageText}>AWARENESS</span>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
