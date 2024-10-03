import React from 'react';
import { Link } from 'react-router-dom';
import styles from './style.component/Header.module.css';
import Menu from './Menu';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { user, logout } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerWrapper}>
          <div className={styles.leftSection}>
            <button 
              className={styles.menuButton}
              onClick={toggleMenu}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? (
                <svg 
                  className={styles.menuIcon} 
                  viewBox="0 0 800 800" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <line x1="200" y1="200" x2="600" y2="600" strokeWidth="40"/>
                  <line x1="200" y1="600" x2="600" y2="200" strokeWidth="40"/>
                </svg>
              ) : (
                <svg 
                  className={styles.menuIcon} 
                  viewBox="0 0 800 800" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect x="150" y="220" width="500" height="40"/>
                  <rect x="150" y="380" width="500" height="40"/>
                  <rect x="150" y="540" width="500" height="40"/>
                </svg>
              )}
            </button>
          </div>
          <div className={styles.centerSection}>
            <Link to="/" className={styles.logo}>OBEY</Link>
          </div>
          <div className={styles.rightSection}>
            <button className={styles.searchButton}>
              🔍
            </button>
            <div className={styles.rightLinks}>
              {user ? (
                <>
                  <Link to={user.role === 'admin' ? "/admin/profile" : "/user/profile"} className={styles.navLink}>
                    Profile
                  </Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" className={styles.navLink}>
                      Admin Dashboard
                    </Link>
                  )}
                  <button onClick={logout} className={styles.navLink}>
                    Logout
                  </button>
                </>
              ) : (
                <Link to="/auth" className={styles.navLink}>SIGN IN</Link>
              )}
              <Link to="/cart" className={styles.bagLink}>
                BAG <span className={styles.bagCount}></span>
              </Link>
            </div>
          </div>
        </div>
      </header>
      <Menu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
};

export default Header;