import React, { useState, useEffect, useCallback } from 'react';
import { getAdminStatistics } from '../services/api';
import { motion } from 'framer-motion';
import { FaChartLine, FaShoppingCart, FaUsers, FaDownload } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import styles from './style.component/Statistics.module.css';
import axios from 'axios';
import moment from 'moment';

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

  const handleDownloadReport = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Format dates properly
      const formattedStartDate = moment(startDate).startOf('day').toISOString();
      const formattedEndDate = moment(endDate).endOf('day').toISOString();
      
      const queryParams = new URLSearchParams({
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        period: period
      }).toString();

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/admin/statistics/download?${queryParams}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Lỗi khi tải báo cáo');
      }

      const blob = await response.blob();
      if (blob.size === 0) {
        throw new Error('Không có dữ liệu báo cáo');
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `bao-cao-thong-ke-${period}-${moment(startDate).format('DDMMYYYY')}-${moment(endDate).format('DDMMYYYY')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      alert('Báo cáo thống kê đã được tải xuống thành công');
    } catch (error) {
      console.error('Error downloading report:', error);
      alert(error.message || 'Có lỗi xảy ra khi tải báo cáo. Vui lòng thử lại sau.');
    }
  };

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
        <button 
          className={styles.downloadButton}
          onClick={handleDownloadReport}
        >
          <FaDownload /> Tải báo cáo PDF
        </button>
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

const SalesChart = ({ data, period, formatCurrency }) => {
  const uniqueId = React.useId();

  return (
    <motion.div
      className={styles.chartContainer}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3>Biểu đồ doanh thu và đơn hàng</h3>
      {data && data.length > 0 ? (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date"
              tickFormatter={(tick) => {
                if (period === 'week') {
                  const [week, year] = tick.split('-');
                  return `Tuần ${week.substring(1)} năm ${year}`;
                }
                return tick;
              }}
            />
            <YAxis 
              yAxisId="left" 
              orientation="left" 
              stroke="#8884d8"
              tickFormatter={(value) => formatCurrency(value)}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              stroke="#82ca9d"
            />
            <Tooltip 
              labelFormatter={(label) => {
                if (period === 'week') {
                  const [week, year] = label.split('-');
                  return `Tuần ${week.substring(1)} năm ${year}`;
                }
                return label;
              }}
              formatter={(value, name) => {
                if (name === "Doanh thu") {
                  return [formatCurrency(value), name];
                }
                return [value, name];
              }}
            />
            <Legend />
            <Bar 
              yAxisId="left" 
              dataKey="revenue" 
              name="Doanh thu" 
              fill="#8884d8"
              key={`revenue-${uniqueId}`}
            />
            <Bar 
              yAxisId="right" 
              dataKey="orders" 
              name="Số đơn hàng" 
              fill="#82ca9d" 
              key={`orders-${uniqueId}`}
            />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <p>Không có dữ liệu cho khoảng thời gian này</p>
      )}
    </motion.div>
  );
};

const TopProductsChart = ({ data, colors }) => {
  // Format dữ liệu trước khi render
  const formattedData = data?.map(product => ({
    ...product,
    totalSold: Number(product.soldQuantity) || 0,
    revenue: Number(product.revenue) || 0,
    name: product.name || 'Không có tên'
  })).filter(product => product.totalSold > 0) || [];

  return (
    <motion.div className={styles.chartContainer}>
      <h3>Top 5 sản phẩm bán chạy</h3>
      {formattedData.length > 0 ? (
        <>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={formattedData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="totalSold"
                nameKey="name"
                label={({ name, totalSold, revenue }) => 
                  `${name}: ${totalSold} (${new Intl.NumberFormat('vi-VN', { 
                    style: 'currency', 
                    currency: 'VND'
                  }).format(revenue)})`
                }
              >
                {formattedData.map((entry, index) => (
                  <Cell key={`cell-${index}-${entry.name}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </>
      ) : (
        <p>Không có dữ liệu sản phẩm bán chạy</p>
      )}
    </motion.div>
  );
};

export default Statistics;
