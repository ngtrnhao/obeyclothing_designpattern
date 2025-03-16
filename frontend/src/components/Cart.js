import React, {
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { Link } from "react-router-dom";
import { CartContext } from "../contexts/CartContext";
import styles from "./style.component/Cart.module.css";
import VoucherInput from "./VoucherInput";
import LoadingSpinner from "./LoadingSpinner";
import CartError from "./CartError";
import { ErrorBoundary } from "react-error-boundary";
import {
  FaTrash,
  FaMinus,
  FaPlus,
  FaArrowLeft,
  FaShoppingBag,
  FaGift,
  FaRegHeart,
  FaChevronRight,
} from "react-icons/fa";

const Cart = () => {
  const {
    cartItems,
    removeFromCart,
    updateCartItem,
    fetchCart,
    voucher,
    discountAmount,
  } = useContext(CartContext);

  const [localCartItems, setLocalCartItems] = useState([]);
  const [stockErrors, setStockErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [updatingItems, setUpdatingItems] = useState({});
  const [localTotal, setLocalTotal] = useState(0);

  const updateQueue = useRef({});
  const updateTimer = useRef({});
  const debounceTimeout = 500;



  useEffect(() => {
    setLocalCartItems(cartItems);
  }, [cartItems]);

  useEffect(() => {
    const newTotal = localCartItems.reduce(
      (sum, item) => sum + item.quantity * item.product.price,
      0
    );
    setLocalTotal(newTotal);
  }, [localCartItems]);

  useEffect(() => {
    const loadCart = async () => {
      try {
        setIsLoading(true);
        await fetchCart();
      } catch (error) {
        console.error("Lỗi khi tải giỏ hàng:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadCart();
  }, [fetchCart]);

  const handleQuantityChange = (itemId, newQuantity) => {
    const item = localCartItems.find((item) => item._id === itemId);
    if (!item) return;

    const stockLimit = item.product.stock;

    if (newQuantity > stockLimit) {
      setStockErrors((prev) => ({
        ...prev,
        [itemId]: `Chỉ còn ${stockLimit} sản phẩm trong kho`,
      }));

      const quantityInput = document.getElementById(`quantity-${itemId}`);
      if (quantityInput) {
        quantityInput.classList.add(styles.shakeAnimation);
        setTimeout(() => {
          quantityInput.classList.remove(styles.shakeAnimation);
        }, 500);
      }

      return;
    }

    setStockErrors((prev) => ({ ...prev, [itemId]: null }));

    setLocalCartItems((prev) =>
      prev.map((item) =>
        item._id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );

    setUpdatingItems((prev) => ({ ...prev, [itemId]: true }));
    updateQueue.current[itemId] = newQuantity;

    if (updateTimer.current[itemId]) {
      clearTimeout(updateTimer.current[itemId]);
    }

    updateTimer.current[itemId] = setTimeout(async () => {
      try {
        await updateCartItem(itemId, { quantity: updateQueue.current[itemId] });
        delete updateQueue.current[itemId];
      } catch (error) {
        if (error.response?.data?.availableStock) {
          const availableStock = error.response.data.availableStock;
          setLocalCartItems((prev) =>
            prev.map((item) =>
              item._id === itemId ? { ...item, quantity: availableStock } : item
            )
          );

          setStockErrors((prev) => ({
            ...prev,
            [itemId]: `Chỉ còn ${availableStock} sản phẩm trong kho`,
          }));
        }
      } finally {
        setUpdatingItems((prev) => ({ ...prev, [itemId]: false }));
      }
    }, debounceTimeout);
  };

  const handleQuantityInputChange = (e, itemId) => {
    const value = e.target.value;
    const item = localCartItems.find((item) => item._id === itemId);
    if (!item) return;

 

    setLocalCartItems((prev) =>
      prev.map((item) =>
        item._id === itemId ? { ...item, displayQuantity: value } : item
      )
    );
  };

  const handleInputBlur = (itemId) => {
    const item = localCartItems.find((item) => item._id === itemId);
    if (!item) return;



    const currentValue = item.displayQuantity;

    let newQuantity = parseInt(currentValue, 10);
    if (isNaN(newQuantity) || newQuantity < 1) {
      newQuantity = 1;
    }

    handleQuantityChange(itemId, newQuantity);

    setLocalCartItems((prev) =>
      prev.map((item) =>
        item._id === itemId ? { ...item, displayQuantity: undefined } : item
      )
    );
  };

  const handleSizeChange = (itemId, newSize) => {
    setUpdatingItems((prev) => ({ ...prev, [itemId]: true }));

    updateCartItem(itemId, { size: newSize })
      .then(() => {
        setLocalCartItems((prev) =>
          prev.map((item) =>
            item._id === itemId ? { ...item, size: newSize } : item
          )
        );
      })
      .catch((error) => {
        console.error("Lỗi khi cập nhật kích thước:", error);
      })
      .finally(() => {
        setUpdatingItems((prev) => ({ ...prev, [itemId]: false }));
      });
  };

  const handleColorChange = (itemId, newColor) => {
    setUpdatingItems((prev) => ({ ...prev, [itemId]: true }));

    updateCartItem(itemId, { color: newColor })
      .then(() => {
        setLocalCartItems((prev) =>
          prev.map((item) =>
            item._id === itemId ? { ...item, color: newColor } : item
          )
        );
      })
      .catch((error) => {
        console.error("Lỗi khi cập nhật màu sắc:", error);
      })
      .finally(() => {
        setUpdatingItems((prev) => ({ ...prev, [itemId]: false }));
      });
  };

  const handleSaveForLater = (productId) => {
    console.log(`Lưu sản phẩm ${productId} để mua sau`);
  };

  const imageUrl = useCallback((img) => {
    if (!img) return "/images/placeholder-image.jpg";
    if (img.startsWith("http")) return img;
    const cleanedPath = img.replace(/^uploads\\/, "");
    return `${process.env.REACT_APP_API_URL}/uploads/${cleanedPath}`;
  }, []);

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner />
        <p>Đang tải giỏ hàng...</p>
      </div>
    );
  }

  if (localCartItems.length === 0) {
    return (
      <div className={styles.emptyCartContainer}>
        <div className={styles.emptyCartIcon}>
          <FaShoppingBag size={60} />
        </div>
        <h2 className={styles.emptyCartTitle}>Giỏ hàng trống</h2>
        <p className={styles.emptyCartMessage}>
          Bạn chưa có sản phẩm nào trong giỏ hàng
        </p>
        <Link to="/products" className={styles.shopNowButton}>
          Mua sắm ngay
        </Link>
      </div>
    );
  }

  return (
    <ErrorBoundary FallbackComponent={CartError}>
      <div className={styles.cartContainer}>
        <div className={styles.cartHeader}>
          <h1 className={styles.cartTitle}>
            <FaShoppingBag className={styles.cartTitleIcon} /> Giỏ hàng của bạn
          </h1>
          <div className={styles.cartBreadcrumb}>
            <span>Giỏ hàng</span>
            <FaChevronRight />
            <span className={styles.inactiveBreadcrumb}>Thanh toán</span>
            <FaChevronRight />
            <span className={styles.inactiveBreadcrumb}>Hoàn tất</span>
          </div>
        </div>

        <div className={styles.cartContent}>
          <div className={styles.cartItems}>
            {localCartItems.map((item) => (
              <div key={item._id} className={styles.cartItem}>
                <div className={styles.itemImageContainer}>
                  <img
                    src={imageUrl(item.product.image)}
                    alt={item.product.name}
                    className={styles.itemImage}
                  />
                </div>

                <div className={styles.itemDetails}>
                  <div className={styles.itemHeader}>
                    <h3 className={styles.itemName}>
                      <Link
                        to={`/product/${item.product.slug || item.product._id}`}
                      >
                        {item.product.name}
                      </Link>
                    </h3>
                    <div className={styles.itemActions}>
                      <button
                        className={styles.wishlistButton}
                        onClick={() => handleSaveForLater(item.product._id)}
                        aria-label="Lưu để mua sau"
                      >
                        <FaRegHeart />
                      </button>
                      <button
                        className={styles.removeButton}
                        onClick={() => removeFromCart(item.product._id)}
                        aria-label="Xóa sản phẩm"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>

                  <div className={styles.itemOptions}>
                    <div className={styles.optionGroup}>
                      <label className={styles.optionLabel}>Kích thước:</label>
                      <select
                        value={item.size}
                        onChange={(e) =>
                          handleSizeChange(item._id, e.target.value)
                        }
                        className={styles.optionSelect}
                      >
                        {item.product.sizes.map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.optionGroup}>
                      <label className={styles.optionLabel}>Màu sắc:</label>
                      <select
                        value={item.color}
                        onChange={(e) =>
                          handleColorChange(item._id, e.target.value)
                        }
                        className={styles.optionSelect}
                      >
                        {item.product.colors.map((color) => (
                          <option key={color} value={color}>
                            {color}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <p
                    className={`${styles.stockInfo} ${
                      item.product.stock < 10 ? styles.lowStock : ""
                    }`}
                  >
                    Còn lại: {item.product.stock} sản phẩm
                  </p>

                  <div className={styles.itemBottom}>
                    <div className={styles.quantityPriceContainer}>
                      <div className={styles.quantityControl}>
                        <button
                          onClick={() =>
                            handleQuantityChange(
                              item._id,
                              Math.max(1, item.quantity - 1)
                            )
                          }
                          className={styles.quantityButton}
                          disabled={
                            item.quantity <= 1 || updatingItems[item._id]
                          }
                        >
                          <FaMinus />
                        </button>
                        <input
                          id={`quantity-${item._id}`}
                          type="text"
                          inputMode="numeric"
                          className={styles.quantityInput}
                          value={
                            item.displayQuantity !== undefined
                              ? item.displayQuantity
                              : item.quantity
                          }
                          onChange={(e) =>
                            handleQuantityInputChange(e, item._id)
                          }
                          onBlur={() => handleInputBlur(item._id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.target.blur();
                            }
                          }}
                        />
                        <button
                          onClick={() =>
                            handleQuantityChange(
                              item._id,
                              Math.min(item.product.stock, item.quantity + 1)
                            )
                          }
                          className={styles.quantityButton}
                          disabled={
                            item.quantity >= item.product.stock ||
                            updatingItems[item._id]
                          }
                        >
                          <FaPlus />
                        </button>
                      </div>

                      {updatingItems[item._id] && (
                        <span className={styles.updatingIndicator}></span>
                      )}

                      {stockErrors[item._id] && (
                        <p className={styles.errorMessage}>
                          {stockErrors[item._id]}
                        </p>
                      )}
                    </div>

                    <div className={styles.priceContainer}>
                      {item.product.originalPrice &&
                      item.product.originalPrice > item.product.price ? (
                        <div className={styles.itemPrice}>
                          {item.product.originalPrice.toLocaleString("vi-VN")}đ
                        </div>
                      ) : null}
                      <div className={styles.itemTotal}>
                        {(item.product.price * item.quantity).toLocaleString(
                          "vi-VN"
                        )}
                        đ
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.orderSummary}>
            <div className={styles.summaryCard}>
              <h2 className={styles.summaryTitle}>Tóm tắt đơn hàng</h2>

              <div className={styles.summaryContent}>
                <div className={styles.summaryRow}>
                  <span>Tạm tính ({localCartItems.length} sản phẩm):</span>
                  <span>{localTotal.toLocaleString("vi-VN")}đ</span>
                </div>

                <div className={styles.voucherSection}>
                  <div className={styles.voucherHeader}>
                    <FaGift className={styles.voucherIcon} />
                    <h3>Mã giảm giá</h3>
                  </div>
                  <VoucherInput />
                </div>

                {voucher && (
                  <div className={styles.discountRow}>
                    <span>Giảm giá ({voucher.code}):</span>
                    <span className={styles.discountAmount}>
                      -{(discountAmount || 0).toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                )}

                <div className={styles.shippingRow}>
                  <span>Phí vận chuyển:</span>
                  <span className={styles.shippingFree}>Miễn phí</span>
                </div>

                <div className={styles.divider}></div>

                <div className={styles.totalRow}>
                  <span>Tổng cộng:</span>
                  <span className={styles.finalAmount}>
                    {(voucher
                      ? localTotal - discountAmount
                      : localTotal
                    ).toLocaleString("vi-VN")}
                    đ
                  </span>
                </div>

                <Link to="/checkout" className={styles.checkoutButton}>
                  Tiến hành thanh toán
                </Link>

                <Link to="/products" className={styles.continueShopping}>
                  <FaArrowLeft /> Tiếp tục mua sắm
                </Link>
              </div>
            </div>

            <div className={styles.policiesCard}>
              <h3>Chính sách mua hàng</h3>
              <ul className={styles.policiesList}>
                <li>Miễn phí giao hàng cho đơn từ 500.000đ</li>
                <li>Đổi trả miễn phí trong 30 ngày</li>
                <li>Thanh toán an toàn và bảo mật</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Cart;
