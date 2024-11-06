const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

exports.sendResetPasswordEmail = async (email, resetUrl) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Đặt lại mật khẩu',
    html: `<p>Bạn đã yêu cầu đặt lại mật khẩu. Vui lòng click vào link sau để đặt lại mật khẩu: <a href="${resetUrl}">${resetUrl}</a></p>`
  };

  try {
    console.log('Attempting to send email...');
    console.log('Email options:', JSON.stringify(mailOptions, null, 2));
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Không thể gửi email đặt lại mật khẩu');
  }
};

exports.sendOrderConfirmationEmail = async (email, order, invoice) => {
  try {
    const formatPrice = (price) => {
      return typeof price === 'number' ? price.toLocaleString('vi-VN') : '0';
    };

    // Log để debug
    console.log('Order shipping fee:', order.shippingFee);
    console.log('Full order data:', JSON.stringify(order, null, 2));

    // Đảm bảo phí ship luôn có giá trị
    const shippingFee = order.shippingFee || 30000;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Xác nhận đơn hàng #${order._id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Cảm ơn bạn đã đặt hàng!</h2>
          <p>Đơn hàng của bạn đã được xác nhận.</p>
          
          <div style="margin: 20px 0; padding: 20px; background-color: #f9f9f9;">
            <h3>Thông tin đơn hàng #${order._id}</h3>
            <p><strong>Ngày đặt hàng:</strong> ${new Date(order.createdAt).toLocaleString('vi-VN')}</p>
            <p><strong>Phương thức thanh toán:</strong> ${
              order.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' :
              order.paymentMethod === 'paypal' ? 'PayPal' : 'Chuyển khoản ngân hàng'
            }</p>
            <p><strong>Địa chỉ giao hàng:</strong><br/>
              ${order.shippingInfo.fullName}<br/>
              ${order.shippingInfo.phone}<br/>
              ${order.shippingInfo.streetAddress}, ${order.shippingInfo.wardName}<br/>
              ${order.shippingInfo.districtName}, ${order.shippingInfo.provinceName}
            </p>
          </div>

          <div style="margin: 20px 0;">
            <h3>Chi tiết đơn hàng:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="background-color: #f2f2f2;">
                <th style="padding: 10px; text-align: left;">Sản phẩm</th>
                <th style="padding: 10px; text-align: right;">Số lượng</th>
                <th style="padding: 10px; text-align: right;">Đơn giá</th>
                <th style="padding: 10px; text-align: right;">Thành tiền</th>
              </tr>
              ${order.items.map(item => `
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #ddd;">
                    ${item.product?.name || 'Sản phẩm không xác định'}
                  </td>
                  <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">
                    ${item.quantity}
                  </td>
                  <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">
                    ${formatPrice(item.price)}đ
                  </td>
                  <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">
                    ${formatPrice(item.price * item.quantity)}đ
                  </td>
                </tr>
              `).join('')}
            </table>
          </div>

          <div style="margin: 20px 0; padding: 20px; background-color: #f9f9f9;">
            <p><strong>Tạm tính:</strong> ${formatPrice(order.totalAmount)}đ</p>
            <p><strong>Phí vận chuyển:</strong> ${formatPrice(shippingFee)}đ</p>
            ${order.discountAmount ? `<p><strong>Giảm giá:</strong> ${formatPrice(order.discountAmount)}đ</p>` : ''}
            <p style="font-size: 18px; color: #e53935;"><strong>Tổng cộng:</strong> ${formatPrice(order.finalAmount)}đ</p>
          </div>

          <div style="margin: 20px 0;">
            <p>Chúng tôi sẽ thông báo cho bạn khi đơn hàng được gửi đi.</p>
            <p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent successfully');
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    throw error;
  }
};