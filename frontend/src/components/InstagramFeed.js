import React, { useEffect } from 'react';
import styles from './style.component/InstagramFeed.module.css';
import { FaInstagram } from 'react-icons/fa';

const InstagramFeed = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '//www.instagram.com/embed.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className={styles.instagramSection}>
      <div className={styles.instagramHeader}>
        <FaInstagram className={styles.instagramIcon} />
        <h2>@OBEY trên Instagram</h2>
      </div>
      
      <div className={styles.instagramEmbed}>
        <blockquote 
          className="instagram-media" 
          data-instgrm-permalink="https://www.instagram.com/obeyclothing/"
          data-instgrm-version="14"
        >
        </blockquote>
      </div>
    </div>
  );
};

export default InstagramFeed; 