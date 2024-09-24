import React, { useState, useEffect } from 'react';
import { getAdminStatistics } from '../services/api';
import { motion } from 'framer-motion';
import { FaChartLine, FaShoppingCart, FaUsers } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import styles from './style.component/Statistics.module.css';

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
      setStats(response.data);
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
          <p>{stats.totalRevenue.toLocaleString('vi-VN')} VND</p>
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
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="revenue" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      <motion.div 
        className={styles.chartContainer}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <h3>Top sản phẩm bán chạy</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={stats.topProducts}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="soldQuantity"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {stats.topProducts.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
};

export default Statistics;