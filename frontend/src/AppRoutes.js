import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import HomePage from './pages/HomePage';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import ProductList from './components/ProductList';
import ProductDetail from './components/ProductDetail';
import Cart from './components/Cart';
import CreateProduct from './components/CreateProduct';
import ResetPassword from './components/ResetPassword';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import ProductManagement from './components/ProductManagement';
import OrderManagement from './components/OrderManagement';
import UserManagement from './components/UserManagement';
import Statistics from './components/Statistics';
import UserProfile from './components/UserProfile';
import UserOrders from './components/UserOrders';
import OrderSuccess from './components/OrderSuccess';
import CategoryManagement from './components/CategoryManagement';
import Checkout from './components/Checkout';
import InventoryManagement from './components/InventoryManagement';
import PurchaseOrderManagement from './components/PurchaseOrderManagement';
import SupplierManagement from './components/SupplierManagement';
import DeliveryManagement from './components/DeliveryManagement';
import VoucherManagement from './components/VoucherManagement';
import Lookbook from './components/Lookbook';
import StoreLocator from './components/StoreLocator';
import OrderDetails from './components/OrderDetails';
import AboutPage from './pages/AboutPage';
import SearchResults from './pages/SearchResults';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/products" element={<ProductList />} />
      <Route path="/product/:slug" element={<ProductDetail />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/category/:slug" element={<ProductList />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/lookbook" element={<Lookbook />} />
      <Route path="/stores" element={<StoreLocator />} />
      <Route path="/about" element={<AboutPage />} />
      <Route 
        path="/user/*" 
        element={
          <ProtectedRoute allowedRoles={['user']}>
            <UserDashboard />
          </ProtectedRoute>
        } 
      >
        <Route index element={<Navigate to="profile" replace />} />
        <Route path="profile" element={<UserProfile />} />
        <Route path="orders" element={<UserOrders />} />
        <Route path="orders/:id" element={<OrderDetails />} />
      </Route>

      <Route 
        path="/admin/*" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      > 
        <Route path="suppliers" element={<SupplierManagement />} />
        <Route path="vouchers" element={<VoucherManagement />} />
        <Route index element={<Navigate to="statistics" replace />} />
        <Route path="profile" element={<UserProfile />} />
        <Route path="products" element={<ProductManagement />} />
        <Route path="orders" element={<OrderManagement />} />
        <Route path="orders/:id" element={<OrderDetails />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="create-product" element={<CreateProduct />} />
        <Route path="statistics" element={<Statistics />} />
        <Route path="categories" element={<CategoryManagement />} />
        <Route path="inventory" element={<InventoryManagement />} />
        <Route path="purchase-orders" element={<PurchaseOrderManagement />} />
        <Route path="deliveries" element={<DeliveryManagement />} />
      </Route>
      
      <Route path="/order-success/:id" element={<OrderSuccess />} />
      <Route path="/search" element={<SearchResults />} />
      
      {/* Catch-all route for 404 Not Found */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
