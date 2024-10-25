import React, { useRef, useEffect } from 'react';
import { PayPalButtons } from "@paypal/react-paypal-js";
import { useNavigate } from 'react-router-dom';
import { completePaypalOrder } from '../services/api';
import { useCart } from '../contexts/CartContext';

const PayPalCheckout = ({ amount, shippingInfo }) => {
  const shippingInfoRef = useRef(shippingInfo);

  useEffect(() => {
    shippingInfoRef.current = shippingInfo;
  }, [shippingInfo]);

  const navigate = useNavigate();
  const { fetchCart } = useCart();

  const handleApprove = async (data, actions) => {
    const order = await actions.order.capture();
    console.log("PayPal order:", order);
    console.log('Shipping info about to be sent to backend:', shippingInfoRef.current);

    try {
      const response = await completePaypalOrder({
        orderId: order.id,
        paypalDetails: order,
        shippingInfo: shippingInfoRef.current
      });
      console.log('Backend response:', response);
      await fetchCart();
      navigate('/order-success');
    } catch (error) {
      console.error("Error completing order:", error);
      alert("There was an error processing your payment. Please try again.");
    }
  };

  return (
    <PayPalButtons
      createOrder={(data, actions) => {
        return actions.order.create({
          purchase_units: [
            {
              amount: {
                value: (amount / 23000).toFixed(2), // Convert VND to USD
              },
            },
          ],
        });
      }}
      onApprove={handleApprove}
    />
  );
};

export default PayPalCheckout;
