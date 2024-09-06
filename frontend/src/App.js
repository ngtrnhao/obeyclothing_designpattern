import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';

function Home() {
  return (
    <div>
      <h1>Trang chủ</h1>
      <nav>
        <ul>
          <li><Link to="/login">Đăng nhập</Link></li>
          <li><Link to="/register">Đăng ký</Link></li>
          <li><Link to="/forgot-password">Quên mật khẩu</Link></li>
        </ul>
      </nav>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:resetToken" element={<ResetPassword />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;