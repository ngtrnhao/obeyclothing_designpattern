import React, { useState, useContext, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './style.component/Header.module.css';
import Menu from './Menu';
import SearchBar from './SearchBar';
import { useAuth } from '../contexts/AuthContext';
import { CartContext } from '../contexts/CartContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { cartItems } = useContext(CartContext);
  const userMenuRef = useRef(null);

  const totalItems = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
            <div className={styles.logoWrapper}>
              <a href="/" className={styles.logo}>
                <span className={styles.srOnly}>Home</span>
              </a>
            </div>
          </div>
          <div className={styles.rightSection}>
            <button 
              className={styles.searchButton}
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search"
            >
              <svg 
                className={styles.searchIcon} 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
                <path 
                  d="M21 21L16.65 16.65" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <div className={styles.rightLinks}>
              <Link to="/cart" className={styles.bagLink}>
                Giỏ Hàng 
                {totalItems > 0 && (
                  <span className={styles.bagCount}>{totalItems}</span>
                )}
              </Link>
              
              <div className={styles.userMenu} ref={userMenuRef}>
                {user ? (
                  <>
                    <button 
                      className={styles.userMenuButton}
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    >
                      Tài Khoản
                    </button>
                    {isUserMenuOpen && (
                      <div className={styles.userMenuDropdown}>
                        <Link 
                          to={user.role === 'admin' ? "/admin/profile" : "/user/profile"}
                          className={styles.menuItem}
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          Thông tin tài khoản
                        </Link>
                        <Link 
                          to="/user/orders" 
                          className={styles.menuItem}
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          Đơn hàng của tôi
                        </Link>
                        {user.role === 'admin' && (
                          <Link 
                            to="/admin" 
                            className={styles.menuItem}
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            Quản Trị
                          </Link>
                        )}
                        <button 
                          onClick={() => {
                            logout();
                            setIsUserMenuOpen(false);
                          }} 
                          className={styles.menuItem}
                        >
                          Đăng Xuất
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <Link to="/login" className={styles.navLink}>
                    Đăng Nhập
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {isSearchOpen && (
          <div className={styles.searchOverlay}>
            <SearchBar onClose={() => setIsSearchOpen(false)} />
          </div>
        )}
      </header>
      <Menu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
};

export default Header;