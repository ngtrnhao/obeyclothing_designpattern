const express = require('express');
const router = express.Router();
const axios = require('axios');

const API_URL = 'https://provinces.open-api.vn/api';

router.get('/provinces', async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/p/`);
    const provinces = response.data.map(p => ({ code: p.code, name: p.name }));
    console.log('Provinces:', provinces);
    res.json(provinces);
  } catch (error) {
    console.error('Error fetching provinces:', error);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách tỉnh/thành phố' });
  }
});

router.get('/districts/:provinceId', async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/p/${req.params.provinceId}?depth=2`);
    const districts = response.data.districts.map(d => ({ code: d.code, name: d.name }));
    console.log('Districts:', districts);
    res.json(districts);
  } catch (error) {
    console.error('Error fetching districts:', error);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách quận/huyện' });
  }
});

router.get('/wards/:districtId', async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/d/${req.params.districtId}?depth=2`);
    const wards = response.data.wards.map(w => ({ code: w.code, name: w.name }));
    console.log('Wards:', wards);
    res.json(wards);
  } catch (error) {
    console.error('Error fetching wards:', error);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách phường/xã' });
  }
});

module.exports = router;