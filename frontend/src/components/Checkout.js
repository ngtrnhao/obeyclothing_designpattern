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
      <div className={styles.mainContent}>
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
          <form
            onSubmit={handleAddOrUpdateAddress}
            className={styles.newAddressForm}
          >
            {renderAddressFields(editingAddress || newAddress)}
            <button type="submit">
              {editingAddress ? "Cập nhật địa chỉ" : "Lưu địa chỉ mới"}
            </button>
          </form>
        )}
        <div className={styles.orderSummary}>
          <h2>Thông tin đơn hàng</h2>
          {cartItems.map((item) => (
            <div key={item._id} className={styles.orderItem}>
              <img src={imageUrl(item.product.image)} alt={item.product.name} />
              <div>
                <h3>{item.product.name}</h3>
                <p>Số lượng: {item.quantity}</p>
                <p>Giá: {item.product.price.toLocaleString("vi-VN")} đ</p>
              </div>
            </div>
          ))}
          <div className={styles.orderTotal}>
            <p>Tạm tính: {total.toLocaleString("vi-VN")} đ</p>
            {voucher && (
              <p className={styles.discount}>
                Giảm giá (Mã: {voucher.code}): -
                {discountAmount.toLocaleString("vi-VN")} đ
              </p>
            )}
            <p>Phí vận chuyển: {shippingFee.toLocaleString("vi-VN")} đ</p>
            <h3>Tổng cộng: {totalWithShipping.toLocaleString("vi-VN")} đ</h3>
          </div>
        </div>
        <div className={styles.paymentSection}>
          <h2>Phương thức thanh toán</h2>
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
              Đặt hàng ({totalWithShipping.toLocaleString("vi-VN")} đ)
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Checkout;
