# TH5 - Blog Project (Refactored with MVC & Modules)

## 📋 Mô tả dự án

Dự án Blog được tái cấu trúc từ TH4 theo mô hình **MVC (Model-View-Controller)** và **Modules**, giúp mã nguồn dễ bảo trì, dễ mở rộng hơn.

## 🏗️ Cấu trúc thư mục

```
TH5/
├── app.js                          # Cấu hình server chính
├── package.json                    # Quản lý dependencies
├── config/
│   └── db.js                       # Module kết nối MongoDB
├── models/
│   └── BlogPost.js                 # Model Blog Post (Mongoose Schema)
├── controllers/
│   └── postController.js           # Controller xử lý logic bài viết
├── routes/
│   └── postRoutes.js               # Routes định tuyến các URL
├── views/                          # EJS templates
│   ├── index.ejs                   # Trang danh sách bài viết
│   ├── create.ejs                  # Form tạo bài viết
│   ├── detail.ejs                  # Chi tiết bài viết
│   └── edit.ejs                    # Form chỉnh sửa bài viết
├── public/                         # Thư mục tài nguyên tĩnh
└── README.md                       # Tài liệu này
```

## 🚀 Cài đặt & Chạy

### 1. Cài đặt Dependencies

```bash
cd TH5
npm install
```

### 2. Đảm bảo MongoDB chạy

MongoDB server phải chạy trên `mongodb://127.0.0.1:27017`

```bash
# Trên Linux/Mac
mongod

# Trên Windows (nếu cài đặt qua Express)
net start MongoDB
```

### 3. Chạy ứng dụng

```bash
npm start
```

hoặc

```bash
node app.js
```

Server sẽ chạy tại: **http://localhost:3000**

## ✨ Các chức năng được hỗ trợ

### ✅ 1. Xem danh sách bài viết
- Truy cập trang chủ `/`
- Hiển thị tất cả bài viết sắp xếp theo ngày tạo (mới nhất trước)
- Bài viết mới nhất được nổi bật riêng
- 3 bài tiếp theo hiển thị dạng grid
- Các bài còn lại hiển thị dạng danh sách

### ✅ 2. Thêm bài viết
- Nhấn nút **+ Tạo bài viết** hoặc truy cập `/blogposts/new`
- Điền tiêu đề và nội dung
- Nhấn **Đăng bài** để lưu
- Được redirect về trang chủ

### ✅ 3. Xem chi tiết bài viết
- Nhấn vào tiêu đề hoặc nút **Xem chi tiết**
- Xem toàn bộ nội dung bài viết
- Xem ngày tạo bài viết

### ✅ 4. Chỉnh sửa bài viết
- Nhấn nút **Sửa** trên bài viết
- Truy cập `/blogposts/:id/edit`
- Chỉnh sửa tiêu đề và nội dung
- Nhấn **Lưu thay đổi** để cập nhật
- Có thể xóa bài viết từ trang sửa

### ✅ 5. Xóa bài viết
- Nhấn nút **Xóa** trên bài viết bất kỳ
- Cần xác nhận trước khi xóa
- Bài viết sẽ bị xóa vĩnh viễn khỏi database

## 📁 Chi tiết các Module

### app.js
- Khởi tạo Express server
- Cấu hình middleware (urlencoded, view engine)
- Kết nối database
- Sử dụng routes từ `routes/postRoutes.js`

### config/db.js
- Module kết nối MongoDB
- Xử lý lỗi kết nối
- Được gọi từ `app.js`

### models/BlogPost.js
- Định nghĩa Mongoose Schema cho bài viết
- Các trường: `title`, `body`, `createdAt`, `updatedAt`
- Được sử dụng trong controller

### controllers/postController.js
- `getAllPosts()`: Lấy tất cả bài viết
- `getCreateForm()`: Hiển thị form tạo
- `createPost()`: Tạo bài viết mới
- `getPostDetail()`: Lấy chi tiết bài viết
- `getEditForm()`: Hiển thị form sửa
- `updatePost()`: Cập nhật bài viết
- `deletePost()`: Xóa bài viết

### routes/postRoutes.js
- Định tuyến tất cả các endpoint
- Liên kết URL với controller methods

### views/
- **index.ejs**: Trang chủ - danh sách bài viết
- **create.ejs**: Form tạo bài mới
- **detail.ejs**: Chi tiết từng bài viết
- **edit.ejs**: Form chỉnh sửa bài viết

## 🎨 Giao diện

- Thiết kế hiện đại với Google Fonts (DM Sans, Playfair Display)
- Responsive design - tương thích thiết bị di động
- Color scheme: Đen, trắng, xám, đỏ, vàng
- CSS được nhúng trực tiếp trong mỗi tệp EJS

## 🔧 Công nghệ sử dụng

- **Express.js 5.2.1** - Web framework
- **MongoDB** - Database
- **Mongoose 9.3.3** - MongoDB ODM
- **EJS 5.0.1** - Template engine
- **Node.js** - Runtime environment

## ✅ Kiểm tra chức năng

### Test Case 1: Tạo bài viết
1. Vào trang chủ
2. Nhấn **+ Tạo bài viết**
3. Nhập tiêu đề: "Bài test"
4. Nhập nội dung: "Đây là bài test"
5. Nhấn **Đăng bài**
6. ✅ Kiểm tra: Bài viết xuất hiện trên trang chủ

### Test Case 2: Xem danh sách
1. Tạo 5+ bài viết
2. Vào trang chủ
3. ✅ Kiểm tra: Bài mới nhất nổi bật, 3 bài tiếp theo hiển thị grid, bài còn lại hiển thị danh sách

### Test Case 3: Xem chi tiết
1. Nhấn vào 1 bài viết bất kỳ
2. ✅ Kiểm tra: Hiển thị đầy đủ tiêu đề, nội dung, ngày tạo, nút sửa/xóa

### Test Case 4: Sửa bài viết
1. Vào chi tiết bài viết
2. Nhấn **Sửa bài viết**
3. Thay đổi tiêu đề hoặc nội dung
4. Nhấn **Lưu thay đổi**
5. ✅ Kiểm tra: Thay đổi được lưu, quay lại trang chi tiết với dữ liệu mới

### Test Case 5: Xóa bài viết
1. Vào chi tiết bài viết hoặc sửa bài viết
2. Nhấn **Xóa bài viết**
3. Xác nhận xóa
4. ✅ Kiểm tra: Bài viết biến mất khỏi danh sách

## 📝 Nhận xét

- **Ưu điểm**: Code được tổ chức rõ ràng theo MVC pattern, dễ bảo trì và mở rộng
- **Cải tiến so với TH4**: Tách biệt concerns, reusable modules, dễ test
- **Có thể cải thiện**: Thêm validation, error handling chi tiết, thêm authentication

---

**Author**: Học viên  
**Date**: 2026  
**Course**: Node.js & MongoDB
