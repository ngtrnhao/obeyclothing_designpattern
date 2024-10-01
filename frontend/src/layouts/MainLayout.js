import React from 'react';
import Header from '../components/Header';
import styles from './MainLayout.module.css';

const MainLayout = ({ children }) => {
  return (
    <div className={styles.layout}>
      <Header />
      <div className={styles.divider}></div>
      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
