import React, { useState, useEffect, useCallback } from 'react';
import { useCart } from '../contexts/CartContext';
import { getUserInfo, updateUserInfo } from '../services/api';
import PayPalCheckout from './PayPalCheckout1';
import styles from './style.component/Checkout.module.css';
import { provinces, getDistricts, getWards } from '../data/vietnamData';

const Checkout = () => {
	const { cartItems, total } = useCart();
	const [userInfo, setUserInfo] = useState({
		fullName: '',
		email: '',
		phone: '',
		streetAddress: '',
		provinceCode: '',
		districtCode: '',
		wardCode: '',
		provinceName: '',
		districtName: '',
		wardName: ''
	});
	const [alternativeShipping, setAlternativeShipping] = useState(false);
	const [altShippingInfo, setAltShippingInfo] = useState({
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
	const [isEditing, setIsEditing] = useState(false);
	const [districts, setDistricts] = useState([]);
	const [wards, setWards] = useState([]);

	const fetchUserInfo = useCallback(async () => {
		try {
			const info = await getUserInfo();
			setUserInfo(info);
			setIsEditing(!isUserInfoComplete(info));
			
			if (info.provinceCode) {
				const districts = getDistricts(info.provinceCode);
				setDistricts(districts);
			}
			
			if (info.districtCode) {
				const wards = getWards(info.provinceCode, info.districtCode);
				setWards(wards);
			}
		} catch (error) {
			console.error('Error fetching user info:', error);
			setIsEditing(true);
		}
	}, []);

	useEffect(() => {
		fetchUserInfo();
	}, [fetchUserInfo]);

	const isUserInfoComplete = (info) => {
		return info.fullName && info.phone && info.streetAddress && info.provinceCode && info.districtCode && info.wardCode;
	};

	const handleInputChange = (e, isAltShipping = false) => {
		const { name, value } = e.target;
		const updateFunction = isAltShipping ? setAltShippingInfo : setUserInfo;
		updateFunction(prev => {
			const updated = { ...prev, [name]: value };
			if (name === 'provinceCode') {
				const selectedProvince = provinces.find(p => p.code === value);
				updated.districtCode = '';
				updated.wardCode = '';
				updated.provinceName = selectedProvince ? selectedProvince.name : '';
				const districts = getDistricts(value);
				setDistricts(districts);
				setWards([]);
			} else if (name === 'districtCode') {
				const selectedDistrict = districts.find(d => d.code === value);
				updated.wardCode = '';
				updated.districtName = selectedDistrict ? selectedDistrict.name : '';
				const wards = getWards(updated.provinceCode, value);
				setWards(wards);
			} else if (name === 'wardCode') {
				const selectedWard = wards.find(w => w.code === value);
				updated.wardName = selectedWard ? selectedWard.name : '';
			}
			console.log('Updated shipping info:', updated);
			return updated;
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		const shippingInfo = alternativeShipping ? altShippingInfo : userInfo;
		
		console.log('Shipping info being sent:', shippingInfo);
		
		if (!isUserInfoComplete(shippingInfo)) {
			alert('Vui lòng điền đầy đủ thông tin địa chỉ giao hàng');
			return;
		}

		try {
			if (!alternativeShipping) {
				const updatedUser = await updateUserInfo(shippingInfo);
				console.log('Updated user info:', updatedUser);
			}
			setIsEditing(false);
			// Proceed to payment or order confirmation
			console.log('Shipping info being sent:', shippingInfo);
		} catch (error) {
			console.error('Error processing order:', error);
			alert('Có lỗi xảy ra khi xử lý đơn hàng. Vui lòng thử lại.');
		}
	};

	const shippingFee = 26000;
	const totalWithShipping = total + shippingFee;

	if (cartItems.length === 0) {
		return <div className={styles.emptyCart}>Giỏ hàng trống</div>;
	}

	const renderAddressFields = (info, isAltShipping = false) => (
		<>
			<input
				type="text"
				name="fullName"
				value={info.fullName}
				onChange={(e) => handleInputChange(e, isAltShipping)}
				placeholder="Họ và tên"
				required
			/>
			{!isAltShipping && (
				<input
					type="email"
					name="email"
					value={info.email}
					onChange={(e) => handleInputChange(e, isAltShipping)}
					placeholder="Email"
					required
				/>
			)}
			<input
				type="tel"
				name="phone"
				value={info.phone}
				onChange={(e) => handleInputChange(e, isAltShipping)}
				placeholder="Số điện thoại"
				required
			/>
			<input
				type="text"
				name="streetAddress"
				value={info.streetAddress}
				onChange={(e) => handleInputChange(e, isAltShipping)}
				placeholder="Địa chỉ"
				required
				/>
			<select
				name="provinceCode"
				value={info.provinceCode}
				onChange={(e) => handleInputChange(e, isAltShipping)}
				required
			>
				<option value="">Chọn Tỉnh/Thành phố</option>
				{provinces.map(province => (
					<option key={province.code} value={province.code}>{province.name}</option>
				))}
			</select>
			<select
				name="districtCode"
				value={info.districtCode}
				onChange={(e) => handleInputChange(e, isAltShipping)}
				required
			>
				<option value="">Chọn Quận/Huyện</option>
				{districts.map(district => (
					<option key={district.code} value={district.code}>{district.name}</option>
				))}
			</select>
			<select
				name="wardCode"
				value={info.wardCode}
				onChange={(e) => handleInputChange(e, isAltShipping)}
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
				{isEditing ? (
					<form onSubmit={handleSubmit}>
						{renderAddressFields(userInfo)}
						<button type="submit">Lưu thông tin</button>
					</form>
				) : (
					<div>
						<p>{userInfo.fullName}</p>
						<p>{userInfo.email}</p>
						<p>{userInfo.phone}</p>
						<p>{userInfo.streetAddress}</p>
						<p>
							{userInfo.wardName && `${userInfo.wardName}, `}
							{userInfo.districtName && `${userInfo.districtName}, `}
							{userInfo.provinceName}
						</p>
						<button onClick={() => setIsEditing(true)}>Chỉnh sửa</button>
					</div>
				)}
				
				<div className={styles.alternativeShipping}>
					<label>
						<input
								type="checkbox"
								checked={alternativeShipping}
								onChange={() => setAlternativeShipping(!alternativeShipping)}
							/>
							Giao hàng tới địa chỉ khác
					</label>
				</div>

				{alternativeShipping && (
					<form className={styles.altShippingForm}>
						{renderAddressFields(altShippingInfo, true)}
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
			{!isEditing && <PayPalCheckout amount={totalWithShipping} shippingInfo={alternativeShipping ? altShippingInfo : userInfo} />}
		</div>
	);
};

export default Checkout;
