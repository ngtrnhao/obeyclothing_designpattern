import React, { useState, useEffect } from 'react';
import { LoadScript, Autocomplete } from '@react-google-maps/api';
import styles from './style.component/AddressAutocomplete.module.css';

const AddressAutocomplete = ({ onAddressSelect, googleMapsApiKey, defaultValue = '' }) => {
  const [inputValue, setInputValue] = useState(defaultValue);
  const [autocomplete, setAutocomplete] = useState(null);

  const onLoad = (autocompleteInstance) => {
    setAutocomplete(autocompleteInstance);
    
    // Cấu hình chi tiết cho Autocomplete
    const options = {
      componentRestrictions: { country: 'vn' },
      fields: ['address_components', 'formatted_address', 'geometry', 'name'],
      strictBounds: false,
      types: ['address', 'establishment'] // Thêm 'establishment' để tìm kiếm địa điểm
    };

    Object.keys(options).forEach(key => {
      autocompleteInstance[`set${key.charAt(0).toUpperCase()}${key.slice(1)}`](options[key]);
    });
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      
      if (!place.geometry) {
        // Người dùng chỉ nhập text mà không chọn từ dropdown
        const manualAddress = {
          streetAddress: inputValue,
          wardName: '',
          districtName: '',
          provinceName: '',
          fullAddress: inputValue,
          location: null
        };
        onAddressSelect(manualAddress);
        return;
      }

      let addressComponents = {
        streetNumber: '',
        route: '',
        ward: '',
        district: '',
        province: ''
      };

      place.address_components?.forEach(component => {
        const types = component.types;

        if (types.includes('street_number')) {
          addressComponents.streetNumber = component.long_name;
        }
        if (types.includes('route')) {
          addressComponents.route = component.long_name;
        }
        if (types.includes('sublocality_level_1') || types.includes('ward')) {
          addressComponents.ward = component.long_name;
        }
        if (types.includes('administrative_area_level_2') || types.includes('district')) {
          addressComponents.district = component.long_name;
        }
        if (types.includes('administrative_area_level_1') || types.includes('city')) {
          addressComponents.province = component.long_name;
        }
      });

      // Nếu không tìm thấy số nhà hoặc tên đường từ API, sử dụng input value
      const streetAddress = addressComponents.streetNumber && addressComponents.route
        ? `${addressComponents.streetNumber} ${addressComponents.route}`
        : inputValue;

      const addressData = {
        streetAddress: streetAddress.trim(),
        wardName: addressComponents.ward,
        districtName: addressComponents.district,
        provinceName: addressComponents.province,
        fullAddress: place.formatted_address || inputValue,
        location: place.geometry ? {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        } : null
      };

      setInputValue(streetAddress);
      onAddressSelect(addressData);
    }
  };

  // Thêm sự kiện keypress để xử lý khi người dùng nhấn Enter
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Xử lý địa chỉ được nhập thủ công
      const manualAddress = {
        streetAddress: inputValue,
        wardName: '',
        districtName: '',
        provinceName: '',
        fullAddress: inputValue,
        location: null
      };
      onAddressSelect(manualAddress);
    }
  };

  return (
    <LoadScript 
      googleMapsApiKey={googleMapsApiKey} 
      libraries={['places']}
      language="vi"
    >
      <div className={styles.autocompleteContainer}>
        <Autocomplete
          onLoad={onLoad}
          onPlaceChanged={onPlaceChanged}
        >
          <input
            type="text"
            className={styles.addressInput}
            placeholder="Nhập số nhà, tên đường..."
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
          />
        </Autocomplete>
      </div>
    </LoadScript>
  );
};

export default AddressAutocomplete; 