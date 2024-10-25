import React, { useState, useEffect, useCallback } from 'react';
import { useCart } from '../contexts/CartContext';
import { getShippingAddresses, addShippingAddress, updateShippingAddress, deleteShippingAddress } from '../services/api';
import PayPalCheckout from './PayPalCheckout1';
import styles from './style.component/Checkout.module.css';
import { provinces, getDistricts, getWards } from '../data/vietnamData';

const Checkout = () => {
	const { cartItems, total } = useCart();
	const [shippingAddresses, setShippingAddresses] = useState([]);
	const [selectedAddressId, setSelectedAddressId] = useState(null);
	const [editingAddress, setEditingAddress] = useState(null);
	const [newAddress, setNewAddress] = useState({
		fullName: '',
		phone: '',
		streetAddress: '',
		provinceCode: '',
		districtCode: '',
		wardCode: '',
		provinceName: '',
		districtName: '',
		wardName: ''
	});
	const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
	const [districts, setDistricts] = useState([]);
	const [wards, setWards] = useState([]);

	const fetchShippingAddresses = useCallback(async () => {
		try {
			const response = await getShippingAddresses();
			console.log('Fetched addresses:', response);
			const addresses = response.data;
			setShippingAddresses(Array.isArray(addresses) ? addresses : []);
			if (addresses.length > 0 && !selectedAddressId) {
				setSelectedAddressId(addresses[0]._id);
			}
		} catch (error) {
			console.error('Error fetching shipping addresses:', error);
			setShippingAddresses([]);
		}
	}, [selectedAddressId]);

	useEffect(() => {
		fetchShippingAddresses();
	}, [fetchShippingAddresses]);

	useEffect(() => {
		console.log('shippingAddresses updated:', shippingAddresses);
	}, [shippingAddresses]);

	useEffect(() => {
		console.log('Selected Address ID:', selectedAddressId);
		console.log('Selected shipping address:', shippingAddresses.find(addr => addr._id === selectedAddressId));
	}, [selectedAddressId, shippingAddresses]);

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		const updatedAddress = editingAddress || newAddress;
		const updated = { ...updatedAddress, [name]: value };

		if (name === 'provinceCode') {
			const selectedProvince = provinces.find(p => p.code === value);
			updated.districtCode = '';
			updated.wardCode = '';
			updated.provinceName = selectedProvince ? selectedProvince.name : '';
			const newDistricts = getDistricts(value);
			setDistricts(newDistricts);
			setWards([]);
		} else if (name === 'districtCode') {
			const selectedDistrict = districts.find(d => d.code === value);
			updated.wardCode = '';
			updated.districtName = selectedDistrict ? selectedDistrict.name : '';
			const newWards = getWards(updated.provinceCode, value);
			setWards(newWards);
		} else if (name === 'wardCode') {
			const selectedWard = wards.find(w => w.code === value);
			updated.wardName = selectedWard ? selectedWard.name : '';
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
			console.log('Dữ liệu địa chỉ trước khi gửi:', addressData);
			
			if (!addressData.streetAddress) {
				throw new Error('Địa chỉ đường không được để trống');
			}
			
			if (editingAddress) {
				updatedAddress = await updateShippingAddress(editingAddress._id, addressData);
			} else {
				updatedAddress = await addShippingAddress(addressData);
			}
			await fetchShippingAddresses();
			setSelectedAddressId(updatedAddress._id);
			setIsAddingNewAddress(false);
			setEditingAddress(null);
			setNewAddress({
				fullName: '',
				phone: '',
				streetAddress: '',
				provinceCode: '',
				districtCode: '',
				wardCode: '',
				provinceName: '',
				districtName: '',
				wardName: ''
			});
		} catch (error) {
			console.error('Error adding/updating address:', error);
			alert('Có lỗi xảy ra khi thêm/cập nhật địa chỉ. Vui lòng thử lại.');
		}
	};

	const handleDeleteAddress = async (addressId) => {
		if (window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) {
			try {
				await deleteShippingAddress(addressId);
				await fetchShippingAddresses();
				if (selectedAddressId === addressId) {
					setSelectedAddressId(null);
				}
			} catch (error) {
				console.error('Error deleting address:', error);
				alert('Có lỗi xảy ra khi xóa địa chỉ. Vui lòng thử lại.');
			}
		}
	};

	const handleEditAddress = (address) => {
		setEditingAddress(address);
		setIsAddingNewAddress(true);
	};

	const shippingFee = 26000;
	const totalWithShipping = total + shippingFee;

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
				{provinces.map(province => (
					<option key={province.code} value={province.code}>{province.name}</option>
				))}
			</select>
			<select
				name="districtCode"
				value={address.districtCode}
				onChange={handleInputChange}
				required
			>
				<option value="">Chọn Quận/Huyện</option>
				{districts.map(district => (
					<option key={district.code} value={district.code}>{district.name}</option>
				))}
			</select>
			<select
				name="wardCode"
				value={address.wardCode}
				onChange={handleInputChange}
				required
			>
				<option value="">Chọn Phường/Xã</option>
				{wards.map(ward => (
					<option key={ward.code} value={ward.code}>{ward.name}</option>
				))}
			</select>
		</>
	);

	return (
		<div className={styles.checkoutContainer}>
			<div className={styles.shippingInfo}>
				<h2>Thông tin giao hàng</h2>
				{shippingAddresses.length > 0 && (
					<div className={styles.savedAddresses}>
						<h3>Địa chỉ đã lưu</h3>
						{shippingAddresses.map(address => (
							<div key={address._id} className={styles.addressItem}>
								<input
									type="radio"
									id={address._id}
									name="selectedAddress"
									value={address._id}
									checked={selectedAddressId === address._id}
									onChange={() => setSelectedAddressId(address._id)}
								/>
								<label htmlFor={address._id}>
									{address.fullName}, {address.phone}, {address.address}, {address.wardName}, {address.districtName}, {address.provinceName}
								</label>
								<button onClick={() => handleEditAddress(address)}>Sửa</button>
								<button onClick={() => handleDeleteAddress(address._id)}>Xóa</button>
							</div>
						))}
					</div>
				)}
				<button onClick={() => {
					setIsAddingNewAddress(!isAddingNewAddress);
					setEditingAddress(null);
				}}>
					{isAddingNewAddress ? 'Hủy' : 'Thêm địa chỉ mới'}
				</button>
				{isAddingNewAddress && (
					<form onSubmit={handleAddOrUpdateAddress} className={styles.newAddressForm}>
						{renderAddressFields(editingAddress || newAddress)}
						<button type="submit">{editingAddress ? 'Cập nhật địa chỉ' : 'Lưu địa chỉ mới'}</button>
					</form>
				)}
			</div>
			<div className={styles.orderSummary}>
				<h2>Thông tin đơn hàng</h2>
				{cartItems.map(item => (
					<div key={item._id} className={styles.orderItem}>
						<img src={`${process.env.REACT_APP_API_URL}/uploads/${item.product.image}`} alt={item.product.name} />
						<div>
							<h3>{item.product.name}</h3>
							<p>Số lượng: {item.quantity}</p>
							<p>Giá: {item.product.price.toLocaleString('vi-VN')} đ</p>
						</div>
					</div>
				))}
				<div className={styles.orderTotal}>
					<p>Tạm tính: {total.toLocaleString('vi-VN')} đ</p>
					<p>Phí vận chuyển: {shippingFee.toLocaleString('vi-VN')} đ</p>
					<h3>Tổng cộng: {totalWithShipping.toLocaleString('vi-VN')} đ</h3>
				</div>
			</div>
			{selectedAddressId && (
				<>
				<PayPalCheckout 
						amount={totalWithShipping} 
						shippingInfo={shippingAddresses.find(addr => addr._id === selectedAddressId)} 
					/>
				</>
			)}
		</div>
	);
};

export default Checkout;
