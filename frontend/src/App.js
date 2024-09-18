import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import MainLayout from './layouts/MainLayout';
import AppRoutes from './AppRoutes';

const paypalOptions = {
  "client-id": process.env.REACT_APP_PAYPAL_CLIENT_ID,
  currency: "USD"
};

function App() {
  return (
    <PayPalScriptProvider options={paypalOptions}>
      <AuthProvider>
        <CartProvider>
          <Router>
            <MainLayout>
              <AppRoutes />
            </MainLayout>
          </Router>
        </CartProvider>
      </AuthProvider>
    </PayPalScriptProvider>
  );
}

export default App;