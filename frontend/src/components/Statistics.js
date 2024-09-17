import React, { useState, useEffect } from 'react';
import { getAdminStatistics } from '../services/api';

const Statistics = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    topProducts: [],
  });

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const response = await getAdminStatistics();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  return (
    <div>
      <h2>Thống kê</h2>
      <div>
        <h3>Tổng doanh thu: {stats.totalRevenue} VND</h3>
        <h3>Tổng số đơn hàng: {stats.totalOrders}</h3>
        <h3>Tổng số người dùng: {stats.totalUsers}</h3>
      </div>
      <div>
        <h3>Top sản phẩm bán chạy:</h3>
        <ul>
          {stats.topProducts.map((product, index) => (
            <li key={index}>
              {product.name} - Số lượng bán: {product.soldQuantity}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Statistics;