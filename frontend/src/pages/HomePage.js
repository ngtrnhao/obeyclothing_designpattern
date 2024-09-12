import React from 'react';
import Home from '../components/Home';
import MainLayout from '../layouts/MainLayout';
import styles from './HomePage.module.css';

const HomePage = () => {
  return (
    <MainLayout>
      <div className={styles.homePage}>
        <Home />
      </div>
    </MainLayout>
  );
};

export default HomePage;
