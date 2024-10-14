import React, { useState, useEffect, useCallback } from 'react';
import { getAdminStatistics } from '../services/api';
import { motion } from 'framer-motion';
import { FaChartLine, FaShoppingCart, FaUsers } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import styles from './style.component/Statistics.module.css';

const Statistics = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    topProducts: [],
    salesData: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)));
  const [endDate, setEndDate] = useState(new Date());
  const [period, setPeriod] = useState('day');

  const fetchStatistics = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAdminStatistics(startDate, endDate, period);
      console.log('Received statistics:', response);
      setStats(response);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      setError('Không thể tải thống kê. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, period]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  if (loading) return <div className={styles.loading}>Đang tải...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  return (
    <div className={styles.statisticsContainer}>
      <h2 className={styles.title}>Thống kê</h2>
      
      <div className={styles.dateControls}>
        <DatePicker
          selected={startDate}
          onChange={date => setStartDate(date)}
          selectsStart
          startDate={startDate}
          endDate={endDate}
        />
        <DatePicker
          selected={endDate}
          onChange={date => setEndDate(date)}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          minDate={startDate}
        />
        <select value={period} onChange={e => setPeriod(e.target.value)}>
          <option value="day">Ngày</option>
          <option value="week">Tuần</option>
          <option value="month">Tháng</option>
        </select>
      </div>

      <div className={styles.statsGrid}>
        <StatCard
          icon={<FaChartLine />}
          title="Tổng doanh thu"
          value={formatCurrency(stats.totalRevenue)}
          delay={0.1}
        />
        <StatCard
          icon={<FaShoppingCart />}
          title="Tổng số đơn hàng đã giao"
          value={stats.totalOrders}
          delay={0.2}
        />
        <StatCard
          icon={<FaUsers />}
          title="Tổng số người dùng"
          value={stats.totalUsers}
          delay={0.3}
        />
      </div>

      <SalesChart
        data={stats.salesData}
        period={period}
        formatCurrency={formatCurrency}
      />

      <TopProductsChart
        data={stats.topProducts}
        colors={COLORS}
      />
    </div>
  );
};

const StatCard = ({ icon, title, value, delay }) => (
  <motion.div 
    className={styles.statCard}
    variants={{
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 },
    }}
    initial="hidden"
    animate="visible"
    transition={{ duration: 0.5, delay }}
  >
    {React.cloneElement(icon, { className: styles.icon })}
    <h3>{title}</h3>
    <p>{value}</p>
  </motion.div>
);

const SalesChart = ({ data, period, formatCurrency }) => (
  <motion.div 
    className={styles.chartContainer}
    variants={{
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 },
    }}
    initial="hidden"
    animate="visible"
    transition={{ duration: 0.5, delay: 0.4 }}
  >
    <h3>Doanh thu theo {period === 'day' ? 'ngày' : period === 'week' ? 'tuần' : 'tháng'}</h3>
    {data && data.length > 0 ? (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart 
          data={data}
          margin={{ top: 20, right: 30, left: 50, bottom: 5 }} // Adjust margins
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tickFormatter={(tick) => {
              if (period === 'week') {
                const [, week] = tick.split('-W');
                return `Tuần ${week}`;
              }
              return tick;
            }}
          />
          <YAxis 
            yAxisId="left" 
            orientation="left" 
            stroke="#8884d8" 
            width={80} // Set width for Y-Axis
          />
          <YAxis 
            yAxisId="right" 
            orientation="right" 
            stroke="#82ca9d" 
          />
          <Tooltip 
            labelFormatter={(label) => {
              if (period === 'week') {
                const [, week] = label.split('-W');
                return `Tuần ${week}`;
              }
              return label;
            }}
            formatter={(value, name) => [formatCurrency(value), name]}
          />
          <Legend />
          <Bar yAxisId="left" dataKey="revenue" fill="#8884d8" name="Doanh thu" />
          <Bar yAxisId="right" dataKey="orders" fill="#82ca9d" name="Số đơn hàng" />
        </BarChart>
      </ResponsiveContainer>
    ) : (
      <p>Không có dữ liệu cho khoảng thời gian này</p>
    )}
  </motion.div>
);

const TopProductsChart = ({ data, colors }) => (
  <motion.div 
    className={styles.chartContainer}
    variants={{
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 },
    }}
    initial="hidden"
    animate="visible"
    transition={{ duration: 0.5, delay: 0.5 }}
  >
    <h3>Top 5 sản phẩm bán chạy</h3>
    {data && data.length > 0 ? (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="totalSold"
            label={({ name, totalSold }) => `${name}: ${totalSold}`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value, name, props) => [`Số lượng: ${value}`, props.payload.name]} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    ) : (
      <p>Không có dữ liệu sản phẩm bán chạy</p>
    )}
  </motion.div>
);

export default Statistics;
