const express = require('express');
const router = express.Router();
const axios = require('axios');

const API_URL = 'https://provinces.open-api.vn/api';

router.get('/provinces', async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/p/`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách tỉnh/thành phố' });
  }
});

router.get('/districts/:provinceId', async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/p/${req.params.provinceId}?depth=2`);
    res.json(response.data.districts);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách quận/huyện' });
  }
});

router.get('/wards/:districtId', async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/d/${req.params.districtId}?depth=2`);
    res.json(response.data.wards);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách phường/xã' });
  }
});

module.exports = router;