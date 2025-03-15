import React, { useState } from "react";
import styles from "./style.component/AddressSection.module.css";
import { FaMapMarkerAlt, FaPencilAlt, FaTrash, FaPlus, FaArrowLeft } from "react-icons/fa";

const AddressSection = ({
  shippingAddresses,
  selectedAddressId,
  setSelectedAddressId,
  handleEditAddress,
  handleDeleteAddress,
  setIsAddingNewAddress,
  isAddingNewAddress,
  newAddress,
  handleAddOrUpdateAddress,
  renderAddressFields,
}) => {
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);

  const defaultAddress = shippingAddresses.find((addr) => addr.isDefault);
  const selectedAddress =
    shippingAddresses.find((addr) => addr._id === selectedAddressId) ||
    defaultAddress;

  const handleAddNewClick = () => {
    setShowAddressForm(true);
    setIsAddingNewAddress(true);
  };

  const handleBackToList = () => {
    setShowAddressForm(false);
    setIsAddingNewAddress(false);
  };

  // Nếu không có địa chỉ nào, hiển thị form thêm địa chỉ mới
  if (!shippingAddresses || shippingAddresses.length === 0) {
    return (
      <div className={styles.shippingInfo}>
        <div className={styles.noAddressMessage}>
          <p>Bạn chưa có địa chỉ giao hàng nào.</p>
          <button
            className={styles.addFirstAddressBtn}
            onClick={handleAddNewClick}
          >
            <FaPlus /> Thêm địa chỉ mới
          </button>
        </div>

        {showAddressForm && (
          <form
            onSubmit={(e) => {
              handleAddOrUpdateAddress(e);
              setShowAddressForm(false);
            }}
          >
            {renderAddressFields(newAddress)}
            <button type="submit" className={styles.submitBtn}>
              Lưu địa chỉ
            </button>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className={styles.shippingInfo}>
      {selectedAddress && (
        <div className={styles.selectedAddressWrapper}>
          <div className={styles.checkIcon}></div>
          <div className={styles.selectedAddressCard}>
            <div className={styles.addressContent}>
              <h3>{selectedAddress.fullName}</h3>
              <p className={styles.phone}>{selectedAddress.phone}</p>
              <p className={styles.streetAddress}>
                {selectedAddress.streetAddress}, {selectedAddress.wardName},{" "}
                {selectedAddress.districtName}, {selectedAddress.provinceName}
              </p>
            </div>
            <button
              className={styles.changeAddressBtn}
              onClick={() => setShowAddressModal(true)}
            >
              Thay đổi
            </button>
          </div>
        </div>
      )}

      {showAddressModal && (
        <div className={styles.addressModal}>
          <div className={styles.modalContent}>
            {!showAddressForm ? (
              <>
                <div className={styles.modalHeader}>
                  <h2>Chọn địa chỉ giao hàng</h2>
                  <button
                    className={styles.addAddressBtn}
                    onClick={handleAddNewClick}
                  >
                    <FaPlus /> Thêm địa chỉ mới
                  </button>
                </div>

                <div className={styles.addressList}>
                  {shippingAddresses.map((address) => (
                    <div
                      key={address._id}
                      className={`${styles.addressCard} ${
                        selectedAddressId === address._id ? styles.selected : ""
                      }`}
                      onClick={() => {
                        setSelectedAddressId(address._id);
                        setShowAddressModal(false);
                      }}
                    >
                      <div className={styles.addressContent}>
                        <div className={styles.addressHeader}>
                          <h3>{address.fullName}</h3>
                          {address.isDefault && (
                            <span className={styles.defaultBadge}>
                              Mặc định
                            </span>
                          )}
                        </div>
                        <p className={styles.phone}>{address.phone}</p>
                        <p className={styles.address}>
                          {address.streetAddress}, {address.wardName},{" "}
                          {address.districtName}, {address.provinceName}
                        </p>
                      </div>

                      <div className={styles.addressActions}>
                        <button
                          className={styles.editBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditAddress(address);
                            setShowAddressModal(false);
                          }}
                        >
                          <FaPencilAlt /> Sửa
                        </button>
                        <button
                          className={styles.deleteBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAddress(address._id);
                          }}
                        >
                          <FaTrash /> Xóa
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className={styles.modalHeader}>
                  <button className={styles.backBtn} onClick={handleBackToList}>
                    <FaArrowLeft /> Quay lại
                  </button>
                  <h2>Thêm địa chỉ mới</h2>
                </div>

                <form
                  onSubmit={(e) => {
                    handleAddOrUpdateAddress(e);
                    setShowAddressForm(false);
                    setShowAddressModal(false);
                  }}
                >
                  {renderAddressFields(newAddress)}
                  <button type="submit" className={styles.submitBtn}>
                    Lưu địa chỉ
                  </button>
                </form>
              </>
            )}

            <button
              className={styles.closeModalBtn}
              onClick={() => {
                setShowAddressModal(false);
                setShowAddressForm(false);
                setIsAddingNewAddress(false);
              }}
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressSection;