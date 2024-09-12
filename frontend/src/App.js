import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import MainLayout from './layouts/MainLayout';
import styles from './App.module.css';

function App() {
  return (
    <Router>
      <div className={styles.app}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<MainLayout><Login /></MainLayout>} />
          <Route path="/register" element={<MainLayout><Register /></MainLayout>} />
          <Route path="/forgot-password" element={<MainLayout><ForgotPassword /></MainLayout>} />
          <Route path="/reset-password/:resetToken" element={<MainLayout><ResetPassword /></MainLayout>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;