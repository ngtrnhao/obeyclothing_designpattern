import React, { useState, useEffect, useCallback } from "react";
import { useCart } from "../contexts/CartContext";
import {
  getShippingAddresses,
  addShippingAddress,
  updateShippingAddress,
  deleteShippingAddress,
} from "../services/api";
import PayPalCheckout from "./PayPalCheckout1";
import styles from "./style.component/Checkout.module.css";
import { provinces, getDistricts, getWards } from "../data/vietnamData";
import { useNavigate } from "react-router-dom";
import AddressSection from "./AddressSection";
import axios from "axios";
import {
  FaShippingFast,
  FaCreditCard,
  FaMapMarkerAlt,
  FaArrowLeft,
  FaCheck,
  FaTruck,
  FaShoppingBag,
} from "react-icons/fa";

const Checkout = () => {
  const { cartItems, total, voucher, discountAmount, finalAmount, clearCart } =
    useCart();
  const [shippingAddresses, setShippingAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [editingAddress, setEditingAddress] = useState(null);
  const [newAddress, setNewAddress] = useState({
    fullName: "",
    phone: "",
    streetAddress: "",
    provinceCode: "",
    districtCode: "",
    wardCode: "",
    provinceName: "",
    districtName: "",
    wardName: "",
  });
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("cod");
  const navigate = useNavigate();

  const paymentMethods = [
    {
      id: "cod",
      name: "Thanh toán khi nhận hàng",
      description: "Thanh toán bằng tiền mặt khi nhận hàng",
      icon: "cash-icon.png",
    },
    {
      id: "paypal",
      name: "PayPal",
      description: "Thanh toán qua PayPal",
      icon: "paypal-icon.png",
    },
    {
      id: "vnpay",
      name: "VNPAY",
      description: "Thanh toán qua VNPAY",
      icon: "vnpay-icon.png",
    },
    {
      id: "banking",
      name: "Chuyển khoản ngân hàng",
      description: "Chuyển khoản qua ngân hàng nội địa",
      icon: "bank-icon.jpg",
      bankInfo: {
        bankName: "Techcombank",
        accountNumber: "167199999999",
        accountName: "OBEY CLOTHING",
        branch: "Chi nhánh HCM",
      },
    },
  ];
  const imageUrl = useCallback((img) => {
    if (!img) return "/images/placeholder-image.jpg";
    if (img.startsWith("http")) return img;
    const cleanedPath = img.replace(/^uploads\\/, "");
    return `${process.env.REACT_APP_API_URL}/uploads/${cleanedPath}`;
  }, []);
  const fetchShippingAddresses = useCallback(async () => {
    try {
      const response = await getShippingAddresses();
      console.log("Fetched addresses:", response);
      const addresses = response.data;
      setShippingAddresses(Array.isArray(addresses) ? addresses : []);
      if (addresses.length > 0 && !selectedAddressId) {
        setSelectedAddressId(addresses[0]._id);
      }
    } catch (error) {
      console.error("Error fetching shipping addresses:", error);
      setShippingAddresses([]);
    }
  }, [selectedAddressId]);

  useEffect(() => {
    fetchShippingAddresses();
  }, [fetchShippingAddresses]);

  useEffect(() => {
    console.log("shippingAddresses updated:", shippingAddresses);
  }, [shippingAddresses]);

  useEffect(() => {
    console.log("Selected Address ID:", selectedAddressId);
    console.log(
      "Selected shipping address:",
      shippingAddresses.find((addr) => addr._id === selectedAddressId)
    );
  }, [selectedAddressId, shippingAddresses]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updatedAddress = editingAddress || newAddress;
    const updated = { ...updatedAddress, [name]: value };

    if (name === "provinceCode") {
      const selectedProvince = provinces.find((p) => p.code === value);
      updated.districtCode = "";
      updated.wardCode = "";
      updated.provinceName = selectedProvince ? selectedProvince.name : "";
      const newDistricts = getDistricts(value);
      setDistricts(newDistricts);
      setWards([]);
    } else if (name === "districtCode") {
      const selectedDistrict = districts.find((d) => d.code === value);
      updated.wardCode = "";
      updated.districtName = selectedDistrict ? selectedDistrict.name : "";
      const newWards = getWards(updated.provinceCode, value);
      setWards(newWards);
    } else if (name === "wardCode") {
      const selectedWard = wards.find((w) => w.code === value);
      updated.wardName = selectedWard ? selectedWard.name : "";
    }

    if (editingAddress) {
      setEditingAddress(updated);
    } else {
      setNewAddress(updated);
    }
  };

  const handleAddOrUpdateAddress = async (e) => {
    e.preventDefault();
    try {
      let updatedAddress;
      const addressData = editingAddress || newAddress;

      if (
        !addressData.fullName ||
        !addressData.phone ||
        !addressData.streetAddress ||
        !addressData.provinceCode ||
        !addressData.districtCode ||
        !addressData.wardCode
      ) {
        throw new Error("Vui lòng điền đầy đủ thông tin địa chỉ");
      }

      console.log("Dữ liệu địa chỉ gửi đi:", {
        fullName: addressData.fullName,
        phone: addressData.phone,
        streetAddress: addressData.streetAddress,
        provinceCode: addressData.provinceCode,
        provinceName: addressData.provinceName,
        districtCode: addressData.districtCode,
        districtName: addressData.districtName,
        wardCode: addressData.wardCode,
        wardName: addressData.wardName,
      });

      if (editingAddress) {
        updatedAddress = await updateShippingAddress(
          editingAddress._id,
          addressData
        );
      } else {
        updatedAddress = await addShippingAddress(addressData);
      }

      console.log("Response từ server:", updatedAddress);

      await fetchShippingAddresses();
      setSelectedAddressId(updatedAddress._id);
      setIsAddingNewAddress(false);
      setEditingAddress(null);
      setNewAddress({
        fullName: "",
        phone: "",
        streetAddress: "",
        provinceCode: "",
        districtCode: "",
        wardCode: "",
        provinceName: "",
        districtName: "",
        wardName: "",
      });
    } catch (error) {
      console.error("Chi tiết lỗi:", error);
      alert(error.message || "Có lỗi xảy ra khi thêm/cập nhật địa chỉ");
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) {
      try {
        await deleteShippingAddress(addressId);
        await fetchShippingAddresses();
        if (selectedAddressId === addressId) {
          setSelectedAddressId(null);
        }
      } catch (error) {
        console.error("Error deleting address:", error);
        alert("Có lỗi xảy ra khi xóa địa chỉ. Vui lòng thử lại.");
      }
    }
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setIsAddingNewAddress(true);
  };

  const shippingFee = 30000;
  const totalWithShipping = finalAmount + shippingFee;

  if (cartItems.length === 0) {
    return <div className={styles.emptyCart}>Giỏ hàng trống</div>;
  }

  const renderAddressFields = (address) => (
    <>
      <input
        type="text"
        name="fullName"
        value={address.fullName}
        onChange={handleInputChange}
        placeholder="Họ và tên"
        required
      />
      <input
        type="tel"
        name="phone"
        value={address.phone}
        onChange={handleInputChange}
        placeholder="Số điện thoại"
        required
      />
      <input
        type="text"
        name="streetAddress"
        value={address.streetAddress}
        onChange={handleInputChange}
        placeholder="Địa chỉ"
        required
      />
      <select
        name="provinceCode"
        value={address.provinceCode}
        onChange={handleInputChange}
        required
      >
        <option value="">Chọn Tỉnh/Thành phố</option>
        {provinces.map((province) => (
          <option key={province.code} value={province.code}>
            {province.name}
          </option>
        ))}
      </select>
      <select
        name="districtCode"
        value={address.districtCode}
        onChange={handleInputChange}
        required
      >
        <option value="">Chọn Quận/Huyện</option>
        {districts.map((district) => (
          <option key={district.code} value={district.code}>
            {district.name}
          </option>
        ))}
      </select>
      <select
        name="wardCode"
        value={address.wardCode}
        onChange={handleInputChange}
        required
      >
        <option value="">Chọn Phường/Xã</option>
        {wards.map((ward) => (
          <option key={ward.code} value={ward.code}>
            {ward.name}
          </option>
        ))}
      </select>
    </>
  );

  const handleCheckout = async () => {
    try {
      if (!selectedAddressId) {
        alert("Vui lòng chọn địa chỉ giao hàng");
        return;
      }

      const shippingInfo = shippingAddresses.find(
        (addr) => addr._id === selectedAddressId
      );

      const token = localStorage.getItem("token");

      if (selectedPaymentMethod === "cod") {
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/orders/create-cod-order`,
          {
            shippingInfo,
            cartItems,
            voucher,
            totalAmount: total,
            shippingFee: 30000,
            discountAmount,
            finalAmount,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data.order) {
          clearCart();
          navigate(`/order-success/${response.data.order._id}`);
        }
      } else if (selectedPaymentMethod === "vnpay") {
        const response = await axios.post(
          "/api/orders/create-vnpay-payment",
          {
            shippingInfo,
            cartItems,
            totalAmount: total,
            shippingFee: 30000,
            discountAmount: discountAmount || 0,
            finalAmount: finalAmount,
            voucher: voucher || null,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data.url) {
          window.location.href = response.data.url;
        } else {
          throw new Error("Không nhận được URL thanh toán");
        }
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.");
    }
  };

  return (
    <div className={styles.checkoutContainer}>
      <div className={styles.checkoutHeader}>
        <h1>Thanh toán</h1>
        <div className={styles.checkoutSteps}>
          <div className={styles.stepItem}>
            <div className={styles.stepIcon}>
              <FaShoppingBag />
            </div>
            <div className={styles.stepLabel}>Giỏ hàng</div>
            <div className={styles.stepDot}></div>
          </div>
          <div className={`${styles.stepLine} ${styles.activeLine}`}></div>
          <div className={`${styles.stepItem} ${styles.activeStep}`}>
            <div className={styles.stepIcon}>
              <FaCreditCard />
            </div>
            <div className={styles.stepLabel}>Thanh toán</div>
            <div className={styles.stepDot}></div>
          </div>
          <div className={styles.stepLine}></div>
          <div className={styles.stepItem}>
            <div className={styles.stepIcon}>
              <FaCheck />
            </div>
            <div className={styles.stepLabel}>Hoàn tất</div>
            <div className={styles.stepDot}></div>
          </div>
        </div>
      </div>

      <div className={styles.checkoutContent}>
        <div className={styles.leftColumn}>
          <div className={styles.addressSection}>
            <div className={styles.sectionHeader}>
              <h2>
                <FaMapMarkerAlt /> Địa chỉ giao hàng
              </h2>
            </div>

            <AddressSection
              shippingAddresses={shippingAddresses}
              selectedAddressId={selectedAddressId}
              setSelectedAddressId={setSelectedAddressId}
              handleEditAddress={handleEditAddress}
              handleDeleteAddress={handleDeleteAddress}
              setIsAddingNewAddress={setIsAddingNewAddress}
              isAddingNewAddress={isAddingNewAddress}
              newAddress={newAddress}
              handleAddOrUpdateAddress={handleAddOrUpdateAddress}
              renderAddressFields={renderAddressFields}
            />

            {isAddingNewAddress && (
              <div className={styles.newAddressFormContainer}>
                <form
                  onSubmit={handleAddOrUpdateAddress}
                  className={styles.newAddressForm}
                >
                  <div className={styles.formHeader}>
                    <h3>
                      {editingAddress ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}
                    </h3>
                  </div>
                  {renderAddressFields(editingAddress || newAddress)}
                  <div className={styles.formActions}>
                    <button
                      type="button"
                      className={styles.cancelButton}
                      onClick={() => {
                        setIsAddingNewAddress(false);
                        setEditingAddress(null);
                      }}
                    >
                      Hủy
                    </button>
                    <button type="submit" className={styles.saveButton}>
                      {editingAddress ? "Cập nhật" : "Lưu địa chỉ"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className={styles.paymentMethodSection}>
              <div className={styles.sectionHeader}>
                <h2>
                  <FaCreditCard /> Phương thức thanh toán
                </h2>
              </div>
              <div className={styles.paymentMethods}>
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`${styles.paymentMethod} ${
                      selectedPaymentMethod === method.id ? styles.selected : ""
                    }`}
                    onClick={() => setSelectedPaymentMethod(method.id)}
                  >
                    <div className={styles.methodInfo}>
                      <div className={styles.radioButton}>
                        <div
                          className={
                            selectedPaymentMethod === method.id
                              ? styles.radioInner
                              : ""
                          }
                        ></div>
                      </div>
                      <img
                        src={`/images/${method.icon}`}
                        alt={method.name}
                        className={styles.methodIcon}
                      />
                      <div>
                        <h3>{method.name}</h3>
                        <p>{method.description}</p>
                      </div>
                    </div>
                    {method.id === "banking" &&
                      selectedPaymentMethod === "banking" && (
                        <div className={styles.bankingInfo}>
                          <p>
                            <strong>Thông tin chuyển khoản:</strong>
                          </p>
                          <p>Ngân hàng: {method.bankInfo.bankName}</p>
                          <p>Số tài khoản: {method.bankInfo.accountNumber}</p>
                          <p>Chủ tài khoản: {method.bankInfo.accountName}</p>
                          <p>Chi nhánh: {method.bankInfo.branch}</p>
                        </div>
                      )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.rightColumn}>
          <div className={styles.orderSummaryCard}>
            <div className={styles.sectionHeader}>
              <h2>
                <FaShoppingBag /> Thông tin đơn hàng
              </h2>
            </div>

            <div className={styles.orderItemsList}>
              {cartItems.map((item) => (
                <div key={item._id} className={styles.orderItem}>
                  <div className={styles.itemImageContainer}>
                    <img
                      src={imageUrl(item.product.image)}
                      alt={item.product.name}
                    />
                    <span className={styles.itemQuantity}>{item.quantity}</span>
                  </div>
                  <div className={styles.itemDetails}>
                    <h3>{item.product.name}</h3>
                    <div className={styles.itemPriceInfo}>
                      <span>
                        {item.product.price.toLocaleString("vi-VN")}đ x{" "}
                        {item.quantity}
                      </span>
                      <span className={styles.itemTotal}>
                        {(item.product.price * item.quantity).toLocaleString(
                          "vi-VN"
                        )}
                        đ
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.orderSummary}>
              <div className={styles.summaryRow}>
                <span>Tạm tính ({cartItems.length} sản phẩm):</span>
                <span>{total.toLocaleString("vi-VN")}đ</span>
              </div>

              {voucher && (
                <div className={styles.summaryRow}>
                  <span>Giảm giá (Mã: {voucher.code}):</span>
                  <span className={styles.discountAmount}>
                    -{discountAmount.toLocaleString("vi-VN")}đ
                  </span>
                </div>
              )}

              <div className={styles.summaryRow}>
                <span>
                  <FaTruck /> Phí vận chuyển:
                </span>
                <span className={styles.shippingFee}>
                  {shippingFee.toLocaleString("vi-VN")}đ
                </span>
              </div>

              <div className={styles.divider}></div>

              <div className={styles.totalRow}>
                <span>Tổng cộng:</span>
                <span className={styles.finalAmount}>
                  {totalWithShipping.toLocaleString("vi-VN")}đ
                </span>
              </div>
            </div>

            {selectedAddressId && (
              <div className={styles.checkoutActions}>
                {selectedPaymentMethod === "paypal" ? (
                  <div className={styles.paypalContainer}>
                    <PayPalCheckout
                      amount={totalWithShipping}
                      shippingInfo={shippingAddresses.find(
                        (addr) => addr._id === selectedAddressId
                      )}
                    />
                  </div>
                ) : (
                  <button
                    className={styles.checkoutButton}
                    onClick={handleCheckout}
                    disabled={!selectedAddressId}
                  >
                    Đặt hàng ({totalWithShipping.toLocaleString("vi-VN")}đ)
                  </button>
                )}

                <button
                  className={styles.backButton}
                  onClick={() => navigate("/cart")}
                >
                  <FaArrowLeft /> Quay lại giỏ hàng
                </button>
              </div>
            )}

            <div className={styles.securityNotice}>
              <div className={styles.securityItem}>
                <FaShippingFast /> <span>Giao hàng nhanh 2-5 ngày</span>
              </div>
              <div className={styles.securityItem}>
                <FaCheck /> <span>Sản phẩm chính hãng 100%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
