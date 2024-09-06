import React, { useState, useEffect } from 'react';
import { login, setAuthToken } from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState(null);

  // Hàm kiểm tra trạng thái khóa dựa trên email
  const checkLockoutStatus = (email) => {
    const storedLockoutTime = localStorage.getItem(`lockoutTime_${email}`);
    const storedAttempts = localStorage.getItem(`loginAttempts_${email}`);

    if (storedLockoutTime) {
      const lockoutEndTime = new Date(storedLockoutTime);
      if (lockoutEndTime > new Date()) {
        setLockoutTime(lockoutEndTime);
      } else {
        localStorage.removeItem(`lockoutTime_${email}`);
        localStorage.removeItem(`loginAttempts_${email}`);
        setLockoutTime(null);
        setLoginAttempts(0);
      }
    } else {
      setLockoutTime(null);
    }

    if (storedAttempts) {
      setLoginAttempts(parseInt(storedAttempts, 10));
    } else {
      setLoginAttempts(0);
    }
  };

  useEffect(() => {
    // Gọi hàm kiểm tra trạng thái khóa mỗi khi email thay đổi
    if (email) {
      checkLockoutStatus(email);
    }
  }, [email]); // Mỗi khi email thay đổi, kiểm tra số lần thử và thời gian khóa

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Nếu tài khoản hiện tại đang bị khóa
    if (lockoutTime && lockoutTime > new Date()) {
      setError(`Tài khoản này đã bị khóa tạm thời. Vui lòng thử lại sau ${getTimeRemaining(lockoutTime)}.`);
      return;
    }

    try {
      // Gọi API đăng nhập
      const response = await login(email, password);
      setAuthToken(response.data.token);
      localStorage.setItem('token', response.data.token);
      setMessage('Đăng nhập thành công');
      setError('');
      resetLoginAttempts(); // Đặt lại số lần thử khi đăng nhập thành công
    } catch (error) {
      handleLoginFailure(); // Xử lý đăng nhập thất bại
    }
  };

  const handleLoginFailure = () => {
    // Tăng số lần thử
    const newAttempts = loginAttempts + 1;
    setLoginAttempts(newAttempts);
    localStorage.setItem(`loginAttempts_${email}`, newAttempts.toString());

    // Nếu số lần thử >= 5 thì khóa tài khoản trong 2 giờ
    if (newAttempts >= 5) {
      const lockoutEndTime = new Date(new Date().getTime() + 2 * 60 * 60 * 1000); // Khóa 2 giờ
      setLockoutTime(lockoutEndTime);
      localStorage.setItem(`lockoutTime_${email}`, lockoutEndTime.toISOString());
      setError(`Tài khoản này đã bị khóa tạm thời. Vui lòng thử lại sau 2 giờ.`);
    } else {
      // Thông báo khi nhập sai tên đăng nhập hoặc mật khẩu
      setError(`Sai tên đăng nhập hoặc mật khẩu. Còn ${5 - newAttempts} lần thử.`);
    }
    setMessage('');
  };

  const resetLoginAttempts = () => {
    setLoginAttempts(0);
    setLockoutTime(null);
    localStorage.removeItem(`loginAttempts_${email}`);
    localStorage.removeItem(`lockoutTime_${email}`);
  };

  const getTimeRemaining = (endTime) => {
    const total = Date.parse(endTime) - Date.parse(new Date());
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    return `${hours} giờ ${minutes} phút`;
  };

  return (
    <div>
      <h2>Đăng nhập</h2>
      {error && <p style={{color: 'red'}}>{error}</p>}
      {message && <p style={{color: 'green'}}>{message}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Mật khẩu:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={lockoutTime && lockoutTime > new Date()}>Đăng nhập</button>
      </form>
    </div>
  );
};

export default Login;
