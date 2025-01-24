# OBEY CLOTHING - Website Thương Mại Điện Tử

## 📝 Mục Lục
- [Giới Thiệu](#giới-thiệu)
- [Tính Năng](#tính-năng)
- [Công Nghệ Sử Dụng](#công-nghệ-sử-dụng)
- [Cài Đặt và Chạy](#cài-đặt-và-chạy)
- [API Documentation](#api-documentation)
- [Giao Diện](#giao-diện)
- [Đóng Góp](#đóng-góp)
- [License](#license)

## 🎯 Giới Thiệu

OBEY CLOTHING là một website thương mại điện tử chuyên về thời trang, được xây dựng trên nền tảng MERN Stack. Website được thiết kế với giao diện hiện đại, thân thiện với người dùng và tích hợp đầy đủ các tính năng của một trang thương mại điện tử chuyên nghiệp.

### Câu Chuyện OBEY
- Thành lập bởi nghệ sĩ đường phố Shepard Fairey năm 2001
- Kết hợp nghệ thuật đường phố, văn hóa punk rock và skateboarding
- Phát triển thành thương hiệu thời trang street style toàn cầu

## ⭐ Tính Năng

### 👤 Người Dùng
- Đăng ký/Đăng nhập tài khoản
- Xem và tìm kiếm sản phẩm theo danh mục
- Quản lý giỏ hàng
- Thanh toán trực tuyến qua PayPal
- Theo dõi đơn hàng
- Chat với bot hỗ trợ
- Quản lý thông tin cá nhân
- Áp dụng mã giảm giá
- Tải xuống hóa đơn PDF

### 👨‍💼 Admin
- Quản lý sản phẩm (CRUD)
- Quản lý danh mục
- Quản lý đơn hàng
- Quản lý kho hàng
- Tạo và quản lý voucher
- Xem báo cáo thống kê
- Xuất báo cáo PDF

## 🛠 Công Nghệ Sử Dụng

### Frontend
- React.js
- CSS Modules
- React Router
- Axios
- React Icons
- React PayPal Button

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Multer
- Cloudinary
- PDFKit
- Node-cron

### Tools & DevOps
- Git
- npm
- ESLint
- Prettier


## 🚀 Cài Đặt và Chạy

### Yêu Cầu Hệ Thống
- Node.js (v14 trở lên)
- MongoDB
- npm hoặc yarn

### Các Bước Cài Đặt

1. Clone dự án:
bash
git clone https://github.com/ngtrnhao/obeyclothing
cd obey-clothing

2. Cài đặt dependencies cho backend:
bash
cd backend
npm install
3. Cài đặt dependencies cho frontend:
bash
cd frontend
npm install
4. Tạo file .env trong thư mục backend:
env
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
PAYPAL_CLIENT_ID=your_paypal_client_id
5. Chạy dự án:
bash
Terminal 1 - Backend
cd backend
npm run dev
Terminal 2 - Frontend
cd frontend
npm start

## 📚 API Documentation

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/profile` - Lấy thông tin người dùng

### Products
- `GET /api/products` - Lấy danh sách sản phẩm
- `GET /api/products/:id` - Lấy chi tiết sản phẩm
- `POST /api/products` - Tạo sản phẩm mới (Admin)
- `PUT /api/products/:id` - Cập nhật sản phẩm (Admin)
- `DELETE /api/products/:id` - Xóa sản phẩm (Admin)

### Orders
- `POST /api/orders` - Tạo đơn hàng mới
- `GET /api/orders` - Lấy danh sách đơn hàng
- `GET /api/orders/:id` - Lấy chi tiết đơn hàng
- `PUT /api/orders/:id/status` - Cập nhật trạng thái đơn hàng (Admin)

## 🎨 Giao Diện

### Responsive Design
- Desktop (>1024px)
- Tablet (768px - 1024px)
- Mobile (<768px)

### Theme
- Màu chủ đạo: #000000, #FFFFFF
- Font chữ: Roboto, Arial
- Icons: React Icons

## 🤝 Đóng Góp

1. Fork dự án
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit thay đổi (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request
