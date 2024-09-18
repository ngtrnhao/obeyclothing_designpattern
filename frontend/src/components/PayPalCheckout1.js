import React, { useContext } from 'react';
import { PayPalButtons } from "@paypal/react-paypal-js";
import { CartContext } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';

const PayPalCheckout = () => {
  const { createPayPalOrder, onPayPalApprove } = useContext(CartContext);
  const navigate = useNavigate();

  return (
    <PayPalButtons
      createOrder={(data, actions) => {
        return createPayPalOrder();
      }}
      onApprove={async (data, actions) => {
        try {
          const details = await onPayPalApprove(data, actions);
          console.log('Payment completed successfully', details);
          navigate('/order-success');
        } catch (error) {
          console.error('PayPal onApprove error:', error);
          alert('Có lỗi xảy ra khi xử lý thanh toán. Vui lòng thử lại.');
        }
      }}
      onError={(err) => {
        console.error('PayPal Checkout error:', err);
        alert('Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại sau.');
      }}
    />
  );
};

export default PayPalCheckout;