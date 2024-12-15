import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getCategories, getProductsByCategorySlug, getAllProducts, addToCart } from '../services/api';
import { FaChevronDown, FaChevronRight, FaShoppingCart, FaCreditCard } from 'react-icons/fa';
import styles from './style.component/ProductList.module.css';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { Helmet } from 'react-helmet';
import LoadingSpinner from './LoadingSpinner';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCart, setAddingToCart] = useState({});
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();

  const findCategoryBySlug = useCallback((categories, targetSlug) => {
    for (let category of categories) {
      if (category.slug === targetSlug) return category;
      if (category.children) {
        const found = findCategoryBySlug(category.children, targetSlug);
        if (found) return found;
      }
    }
    return null;
  }, []);

  const getParentIds = useCallback((categories, targetId, parents = []) => {
    for (let category of categories) {
      if (category.children) {
        if (category.children.some(child => child._id === targetId)) {
          parents.push(category._id);
        }
        getParentIds(category.children, targetId, parents);
      }
    }
    return parents;
  }, []);

  const imageUrl = useCallback((img) => {
    if (!img) return '/images/placeholder-image.jpg';
    if (img.startsWith('http')) return img;
    const cleanedPath = img.replace(/^uploads\\/, '');
    return `${process.env.REACT_APP_API_URL}/uploads/${cleanedPath}`;
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const categoriesData = await getCategories();
      setCategories(categoriesData);

      if (slug) {
        const category = categoriesData.find(cat => cat.slug === slug);
        setCurrentCategory(category || null);
        const productsData = await getProductsByCategorySlug(slug);
        setProducts(productsData);
        setHasMore(false);
      } else {
        setCurrentCategory(null);
        const response = await getAllProducts(page);
        if (page === 1) {
          setProducts(response.products);
        } else {
          setProducts(prev => [...prev, ...response.products]);
        }
        setHasMore(response.hasMore);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  }, [slug, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setPage(1);
  }, [slug]);

  useEffect(() => {
    if (slug && categories.length > 0) {
      const currentCat = findCategoryBySlug(categories, slug);
      if (currentCat) {
        const parentIds = getParentIds(categories, currentCat._id);
        const newExpandedCategories = {};
        parentIds.forEach(id => {
          newExpandedCategories[id] = true;
        });
        setExpandedCategories(newExpandedCategories);
      }
    }
  }, [slug, categories, findCategoryBySlug, getParentIds]);

  const toggleCategory = (categoryId, e) => {
    e.preventDefault();
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const renderCategories = (categories, level = 0) => {
    return categories.map(category => (
      <div key={category._id} className={styles.categoryItem}>
        <div className={styles.categoryHeader}>
          {category.children?.length > 0 && (
            <button 
              className={styles.toggleButton}
              onClick={(e) => toggleCategory(category._id, e)}
            >
              {expandedCategories[category._id] ? <FaChevronDown /> : <FaChevronRight />}
            </button>
          )}
          <Link 
            to={`/category/${category.slug}`}
            className={`${styles.categoryLink} ${slug === category.slug ? styles.activeCategory : ''}`}
          >
            {category.name}
          </Link>
        </div>
        {category.children?.length > 0 && expandedCategories[category._id] && (
          <div className={styles.childCategories}>
            {renderCategories(category.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  const handleAddToCart = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng');
      navigate('/login');
      return;
    }

    if (product.stock === 0) {
      toast.error('Sản phẩm đã hết hàng');
      return;
    }

    setAddingToCart(prev => ({ ...prev, [product._id]: true }));
    
    try {
      const cartItem = {
        productId: product._id,
        quantity: 1,
        size: product.sizes[0],
        color: product.colors[0]
      };

      await addToCart(cartItem);
      
      setSelectedProduct(product);
      setShowModal(true);
      toast.success('Đã thêm vào giỏ hàng');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error(error.response?.data?.message || 'Không thể thêm vào giỏ hàng');
    } finally {
      setAddingToCart(prev => ({ ...prev, [product._id]: false }));
    }
  };

  const renderModal = () => {
    if (!showModal || !selectedProduct) return null;

    return (
      <div className={styles.modal}>
        <div className={styles.modalContent}>
          <h2>Đã thêm sản phẩm vào giỏ hàng!</h2>
          <div className={styles.modalButtons}>
            <button 
              onClick={() => { 
                setShowModal(false); 
                navigate('/products'); 
              }}
              className={styles.continueButton}
            >
              Tiếp tục mua hàng
            </button>
            <button 
              onClick={() => { 
                setShowModal(false); 
                navigate('/cart'); 
              }}
              className={styles.viewCartButton}
            >
              Xem giỏ hàng
            </button>
          </div>
        </div>
      </div>
    );
  };

  const lastProductRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !slug) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore, slug]);

  if (loading && products.length === 0) return <LoadingSpinner />;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <>
      <Helmet>
        <title>Sản phẩm | OBEY Clothing Vietnam</title>
        <meta name="description" content="Khám phá bộ sưu tập thời trang OBEY mới nhất" />
      </Helmet>
      <div className={styles.container}>
        <div className={styles.contentWrapper}>
          <aside className={styles.sidebar}>
            <h2 className={styles.sidebarTitle}>DANH MỤC SẢN PHẨM</h2>
            <nav className={styles.categoryNav}>
              <Link 
                to="/products" 
                className={`${styles.categoryLink} ${!slug ? styles.activeLink : ''}`}
              >
                Tất cả sản phẩm
              </Link>
              {categories.map(category => (
                <div key={category._id} className={styles.categoryItem}>
                  <div className={styles.categoryHeader}>
                    <Link 
                      to={`/category/${category.slug}`}
                      className={`${styles.categoryLink} ${slug === category.slug ? styles.activeLink : ''}`}
                    >
                      {category.name}
                    </Link>
                    {category.children?.length > 0 && (
                      <button 
                        className={styles.expandButton}
                        onClick={(e) => toggleCategory(category._id, e)}
                      >
                        {expandedCategories[category._id] ? '>' : '>'}
                      </button>
                    )}
                  </div>
                  {expandedCategories[category._id] && category.children?.length > 0 && (
                    <div className={styles.subCategories}>
                      {category.children.map(child => (
                        <Link
                          key={child._id}
                          to={`/category/${child.slug}`}
                          className={`${styles.categoryLink} ${styles.subLink} ${slug === child.slug ? styles.activeLink : ''}`}
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </aside>

          <main className={styles.mainContent}>
            <h1 className={styles.pageTitle}>
              {currentCategory ? currentCategory.name : 'TẤT CẢ SẢN PHẨM'}
            </h1>
            
            <div className={styles.productGrid}>
              {products.map((product, index) => (
                <article key={product._id} className={styles.productCard}>
                  <Link to={`/product/${product.slug}`} className={styles.productLink}>
                    <div className={styles.imageWrapper}>
                      <div className={styles.imageInner}>
                        <img 
                          src={imageUrl(product.image)}
                          alt={product.name} 
                          className={styles.productImage}
                        />
                      </div>
                    </div>
                    <div className={styles.productInfo}>
                      <h2 className={styles.productName}>{product.name}</h2>
                      <p className={styles.productPrice}>
                        {product.price.toLocaleString('vi-VN')} đ
                      </p>
                    </div>
                  </Link>
                  <div className={styles.productActions}>
                    <button 
                      className={`${styles.actionButton} ${styles.addToCart}`}
                      onClick={(e) => handleAddToCart(e, product)}
                      disabled={addingToCart[product._id]}
                    >
                      <FaShoppingCart />
                      {addingToCart[product._id] ? 'Đang thêm...' : 'Thêm vào giỏ'}
                    </button>
                    <Link 
                      to={`/product/${product.slug}`}
                      className={`${styles.actionButton} ${styles.buyNow}`}
                    >
                      <FaCreditCard />
                      Mua ngay
                    </Link>
                  </div>
                </article>
              ))}
            </div>
            {loading && <LoadingSpinner />}
            <div ref={lastProductRef} />
          </main>
        </div>
        {renderModal()}
      </div>
    </>
  );
};

export default ProductList;