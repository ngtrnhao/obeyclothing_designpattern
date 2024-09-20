const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // use TLS
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