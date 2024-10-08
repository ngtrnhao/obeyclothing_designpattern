import React, { useState, useEffect } from 'react';
import { getAdminStatistics } from '../services/api';
import { motion } from 'framer-motion';
import { FaChartLine, FaShoppingCart, FaUsers } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import styles from './style.component/Statistics.module.css';

const getSoldQuantity = (product) => {
  return product.soldQuantity || 0;
};

const sortProductsBySoldQuantity = (products) => {
  return [...products].sort((a, b) => getSoldQuantity(b) - getSoldQuantity(a));
};

const Statistics = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    topProducts: [],
    monthlySales: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await getAdminStatistics();
      console.log("Received statistics:", response);
      console.log("Top Products:", response.topProducts); // Thêm dòng này
      
      // Kiểm tra và xử lý dữ liệu
      if (response && typeof response === 'object') {
        setStats({
          totalRevenue: response.totalRevenue || 0,
          totalOrders: response.totalOrders || 0,
          totalUsers: response.totalUsers || 0,
          topProducts: Array.isArray(response.topProducts) ? response.topProducts : [],
          monthlySales: Array.isArray(response.monthlySales) ? response.monthlySales : []
        });
      } else {
        throw new Error('Invalid data format received from server');
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
      setError('Không thể tải thống kê. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className={styles.loading}>Đang tải...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const prepareTopProductsData = (products) => {
    const sortedProducts = sortProductsBySoldQuantity(products);
    return sortedProducts.slice(0, 5).map(product => ({
      name: product.name,
      value: getSoldQuantity(product)
    }));
  };

  return (
    <div className={styles.statisticsContainer}>
      <h2 className={styles.title}>Thống kê</h2>
      <div className={styles.statsGrid}>
        <motion.div 
          className={styles.statCard}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <FaChartLine className={styles.icon} />
          <h3>Tổng doanh thu</h3>
          <p>{formatCurrency(stats.totalRevenue)}</p>
        </motion.div>
        <motion.div 
          className={styles.statCard}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <FaShoppingCart className={styles.icon} />
          <h3>Tổng số đơn hàng</h3>
          <p>{stats.totalOrders}</p>
        </motion.div>
        <motion.div 
          className={styles.statCard}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <FaUsers className={styles.icon} />
          <h3>Tổng số người dùng</h3>
          <p>{stats.totalUsers}</p>
        </motion.div>
      </div>

      {stats.monthlySales && stats.monthlySales.length > 0 && (
        <motion.div 
          className={styles.chartContainer}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h3>Doanh thu theo tháng</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.monthlySales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                scale="point" 
                padding={{ left: 10, right: 10 }}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                tickFormatter={(value) => `${value / 1000000}M`}
                tick={{ fontSize: 12 }}
              />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="revenue" fill="#8884d8" name="Doanh thu" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {stats.topProducts && stats.topProducts.length > 0 && (
        <motion.div 
          className={styles.chartContainer}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h3>Top 5 sản phẩm bán chạy</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={prepareTopProductsData(stats.topProducts)}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {prepareTopProductsData(stats.topProducts).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [`Số lượng bán: ${value}`, name]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      )}
    </div>
  );
};

export default Statistics;