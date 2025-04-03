import axios from "axios";
export class CODPayment {
  async execute({ shippingInfo, cartItems, voucher, total, discountAmount, finalAmount, token, clearCart, navigate }) {
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/api/orders/create-cod-order`,
      {
        shippingInfo,
        cartItems,
        voucher,
        totalAmount: total,
        shippingFee: 30000,
        discountAmount,
        finalAmount,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.order) {
      clearCart();
      navigate(`/order-success/${response.data.order._id}`);
    }
  }
}

export class VNPayPayment {
  async execute({ shippingInfo, cartItems, total, discountAmount, finalAmount, voucher, token }) {
    const response = await axios.post(
      "/api/orders/create-vnpay-payment",
      {
        shippingInfo,
        cartItems,
        totalAmount: total,
        shippingFee: 30000,
        discountAmount: discountAmount || 0,
        finalAmount: finalAmount,
        voucher: voucher || null,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.url) {
      window.location.href = response.data.url;
    } else {
      throw new Error("Không nhận được URL thanh toán");
    }
  }
}

export class PayPalPayment {
  async execute({ totalWithShipping, shippingInfo }) {
    // PayPal logic is handled in the PayPalCheckout component
    console.log("PayPal payment initiated for:", totalWithShipping, shippingInfo);
  }
}