import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProductById, addToCart, getCart, getProducts, getCategoryPath } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { CartContext } from '../contexts/CartContext';
import styles from './style.component/ProductDetail.module.css';
import ProductReviews from './ProductReviews';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'; // Thêm import cho biểu tượng mũi tên
import placeholderImage from '../components/placeholder.png'

const ProductDetail = () => {
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const { id } = useParams();
  const { user } = useAuth();
  const { setCartItems } = useContext(CartContext);
  const navigate = useNavigate();
  const [categoryPath, setCategoryPath] = useState('');

  useEffect(() => {
    const fetchProductAndRelated = async () => {
      try {
        const productResponse = await getProductById(id);
        console.log('Product data:', productResponse.data);
        setProduct(productResponse.data);
        setSelectedImage(0);
        if (productResponse.data.sizes.length > 0) {
          setSelectedSize(productResponse.data.sizes[0]);
        }
        if (productResponse.data.colors.length > 0) {
          setSelectedColor(productResponse.data.colors[0]);
        }

        // Fetch related products
        const relatedResponse = await getProducts({ 
          category: productResponse.data.category,
          limit: 4,
          exclude: id
        });
        setRelatedProducts(relatedResponse.data);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Không thể tải thông tin sản phẩm');
      }
    };
    fetchProductAndRelated();
  }, [id]);

  useEffect(() => {
    const fetchCategoryPath = async () => {
      if (product && product.category) {
        try {
          const response = await getCategoryPath(product.category);
          setCategoryPath(response.path);
        } catch (error) {
          console.error('Error fetching category path:', error);
        }
      }
    };
    fetchCategoryPath();
  }, [product]);

  const handleAddToCart = async () => {
    if (!user) {
      setError('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
      return;
    }
    if (product.stock === 0) {
      setError('Sản phẩm đã hết hàng');
      return;
    }
    try {
      await addToCart(id, quantity, selectedSize, selectedColor);
      const updatedCart = await getCart();
      setCartItems(updatedCart.items);
      navigate('/cart');
    } catch (err) {
      console.error('Error adding to cart:', err);
      setError('Không thể thêm sản phẩm vào giỏ hàng');
    }
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= product.stock) {
      setQuantity(value);
    }
  };

  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(prevQuantity => prevQuantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prevQuantity => prevQuantity - 1);
    }
  };

  const handleNextImage = () => {
    if (selectedImage < product.detailImages.length) {
      setSelectedImage(prevImage => prevImage + 1);
    }
  };

  const handlePrevImage = () => {
    if (selectedImage > 0) {
      setSelectedImage(prevImage => prevImage - 1);
    }
  };

  const imageUrl = (img) => {
    if (!img) return placeholderImage;
    if (img.startsWith('http')) return img;
    return `${process.env.REACT_APP_API_URL}/uploads/${img.split('/').pop()}`;
  };
  if (!product) return <div className={styles.loading}>Đang tải...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.productDetail}>
      <div className={styles.productMain}>
        <div className={styles.imageSection}>
          <div className={styles.thumbnails}>
            {[product.image, ...(product.detailImages || [])].map((img, index) => (
              <div 
                key={index} 
                className={`${styles.thumbnailContainer} ${selectedImage === index ? styles.selected : ''}`}
                onClick={() => setSelectedImage(index)}
              >
                <img
                  src={imageUrl(img)}
                  alt={`Thumbnail ${index + 1}`}
                  className={styles.thumbnail}
                  onError={(e) => {
                    console.error("Error loading image:", e.target.src);
                    e.target.onerror = null;
                    e.target.src = placeholderImage;
                  }}
                />
              </div>
            ))}
          </div>
          <div className={styles.mainImageContainer}>
            <img
              className={styles.mainImage}
              src={imageUrl([product.image, ...(product.detailImages || [])][selectedImage])}
              alt={product.name}
              onError={(e) => {
                console.error("Error loading image:", e.target.src);
                e.target.onerror = null;
                e.target.src = placeholderImage;
              }}
            />
            <div className={styles.imageNavigation}>
              <button onClick={handlePrevImage} disabled={selectedImage === 0} className={styles.navButton}>
                <FaChevronLeft />
              </button>
              <button onClick={handleNextImage} disabled={selectedImage === product.detailImages.length} className={styles.navButton}>
                <FaChevronRight />
              </button>
            </div>
          </div>
        </div>
        <div className={styles.productInfo}>
          <h1 className={styles.productName}>{product.name}</h1>
          <p className={styles.price}>{product.price.toLocaleString('vi-VN')} đ</p>
          <p className={styles.category}>Danh mục: {categoryPath}</p>
          <p className={styles.description}>{product.description}</p>
          <div className={styles.colorSection}>
            <span className={styles.label}>Màu sắc:</span>
            <select
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className={styles.colorSelect}
            >
              {product.colors.map((color, index) => (
                <option key={index} value={color}>{color}</option>
              ))}
            </select>
          </div>
          <div className={styles.sizeSection}>
            <span className={styles.label}>Kích thước:</span>
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className={styles.sizeSelect}
            >
              {product.sizes.map((size, index) => (
                <option key={index} value={size}>{size}</option>
              ))}
            </select>
          </div>
          <div className={styles.quantitySection}>
            <span className={styles.label}>Số lượng:</span>
            <div className={styles.quantityControl}>
              <button onClick={decrementQuantity} className={styles.quantityButton}>-</button>
              <input
                type="number"
                value={quantity}
                onChange={handleQuantityChange}
                min="1"
                max={product.stock}
                className={styles.quantityInput}
              />
              <button onClick={incrementQuantity} className={styles.quantityButton}>+</button>
            </div>
          </div>
          <p className={styles.stock}>
            {product.stock > 0 ? `Còn hàng: ${product.stock}` : 'Hết hàng'}
          </p>
          <button 
            className={styles.addToCartButton} 
            onClick={handleAddToCart} 
            disabled={product.stock === 0}
          >
            {product.stock > 0 ? 'Thêm vào giỏ hàng' : 'Hết hàng'}
          </button>
        </div>
      </div>

      <ProductReviews productId={id} />

      {relatedProducts.length > 0 && (
        <div className={styles.relatedProducts}>
          <h3>Sản phẩm liên quan</h3>
          <div className={styles.productGrid}>
            {relatedProducts.map(relatedProduct => (
              <div key={relatedProduct._id} className={styles.relatedProductCard}>
                <img src={`${process.env.REACT_APP_API_URL}${relatedProduct.image}`} alt={relatedProduct.name} />
                <h4>{relatedProduct.name}</h4>
                <p>{relatedProduct.price.toLocaleString('vi-VN')} đ</p>
                <Link to={`/products/${relatedProduct._id}`}>Xem chi tiết</Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;