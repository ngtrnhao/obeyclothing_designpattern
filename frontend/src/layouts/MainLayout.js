import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Menu from '../components/Menu';
import styles from './MainLayout.module.css';

const MainLayout = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className={styles.layout}>
      <Header onMenuToggle={toggleMenu} />
      <div className={styles.divider}></div>
      <Menu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <main className={styles.main}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
