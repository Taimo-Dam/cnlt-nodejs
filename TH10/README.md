# 💬 Ứng Dụng Chat Realtime

Một ứng dụng chat realtime được xây dựng bằng Node.js, Express và Socket.IO cho phép người dùng giao tiếp trực tiếp mà không cần tải lại trang.

## ✨ Tính năng

- ✅ **Nhập tên để tham gia** - Người dùng nhập tên khi vào hệ thống
- ✅ **Danh sách người dùng online** - Hiển thị tất cả người dùng đang kết nối
- ✅ **Chat riêng** - Cho phép chọn người dùng để chat một-một
- ✅ **Tin nhắn realtime** - Gửi và nhận tin nhắn tức thì không cần reload
- ✅ **Cập nhật tự động** - Danh sách người dùng cập nhật khi có ai tham gia/rời đi
- ✅ **Chỉ báo đang gõ** - Thấy khi người khác đang soạn tin nhắn
- ✅ **Lịch sử tin nhắn** - Lưu giữ lịch sử cuộc trò chuyện
- ✅ **Giao diện đáp ứng** - Hoạt động tốt trên desktop, tablet, và mobile

## 🚀 Cài đặt

### 1. Cài đặt Dependencies
```bash
cd TH10
npm install
```

### 2. Chạy Server
```bash
npm start
```

Hoặc dùng nodemon để auto-reload trong development:
```bash
npm run dev
```

### 3. Mở ứng dụng
Mở browser và truy cập:
```
http://localhost:3000
```

## 📂 Cấu trúc Dự án

```
TH10/
├── app.js                 # Server chính (Express + Socket.IO)
├── package.json           # Dependencies
├── public/
│   ├── index.html        # Giao diện HTML
│   ├── css/
│   │   └── style.css     # Styling CSS tùy chỉnh
│   └── js/
│       └── client.js     # Logic phía client
└── README.md             # Tài liệu này
```

## 🔧 Công Nghệ Sử Dụng

| Công Nghệ | Phiên bản | Mục đích |
|-----------|----------|---------|
| **Node.js** | v14+ | Runtime JavaScript server |
| **Express** | 4.18.2 | Framework web |
| **Socket.IO** | 4.5.4 | Realtime bidirectional communication |
| **HTML5** | - | Markup giao diện |
| **CSS3** | - | Styling và responsive design |
| **JavaScript (Vanilla)** | ES6+ | Client-side logic |

## 📋 Yêu cầu Dữ liệu

Ứng dụng lưu trữ và xử lý các dữ liệu sau:

| Dữ liệu | Kiểu | Mô tả |
|---------|------|-------|
| **Username** | String | Tên người dùng (2-20 ký tự) |
| **SocketId** | String | ID kết nối Socket.IO |
| **Sender** | String | Tên người gửi tin nhắn |
| **Receiver** | String | Tên người nhận tin nhắn |
| **Message** | String | Nội dung tin nhắn |
| **Timestamp** | DateTime | Thời gian gửi tin nhắn |

## 🎮 Cách Sử Dụng

### 1. **Tham gia Chat**
   - Mở http://localhost:3000
   - Nhập tên người dùng (2-20 ký tự)
   - Nhấn "Tham Gia"

### 2. **Chọn Người Dùng**
   - Danh sách người dùng online hiển thị ở sidebar trái
   - Click vào tên một người dùng để bắt đầu chat

### 3. **Gửi Tin Nhắn**
   - Gõ tin nhắn trong khung nhập phía dưới
   - Nhấn "Gửi" hoặc Enter để gửi
   - Tin nhắn của bạn (bên phải, màu xanh)
   - Tin nhắn từ người khác (bên trái, màu xám)

### 4. **Thoát**
   - Nhấn nút "Thoát" ở sidebar để rời khỏi ứng dụng

## 🎨 Giao Diện

### Thiết kế chính:
- **Bảng màu Modern**: Gradient tím-xanh
- **Sidebar**: Danh sách người dùng online với trạng thái
- **Main Chat Area**: Vùng hiển thị tin nhắn và nhập liệu
- **Responsive Design**: Tự động điều chỉnh cho mobile/tablet

### Các thành phần UI:
- **Join Screen**: Màn hình tham gia với animation
- **User List**: Danh sách với status indicator
- **Message Bubbles**: Phân biệt sender/receiver
- **Typing Indicator**: Animation khi người khác đang gõ
- **Notifications**: Thông báo khi user tham gia/rời

## 🔌 Socket.IO Events

### Client → Server

| Event | Dữ liệu | Mô tả |
|-------|---------|-------|
| `join` | `username: string` | Tham gia chat với tên |
| `sendMessage` | `{receiver, receiverId, message}` | Gửi tin nhắn |
| `typing` | `{receiverId}` | Báo hiệu đang gõ |
| `stopTyping` | `{receiverId}` | Dừng báo hiệu gõ |

### Server → Client

| Event | Dữ liệu | Mô tả |
|-------|---------|-------|
| `userList` | `[{id, username}]` | Danh sách user online |
| `newMessage` | `{sender, receiver, message, timestamp}` | Tin nhắn mới |
| `messageSent` | `{...}` | Xác nhận tin nhắn gửi |
| `notification` | `{message, type, timestamp}` | Thông báo hệ thống |
| `userTyping` | `{username, senderId}` | User đang gõ |
| `userStopTyping` | `{senderId}` | User dừng gõ |
| `messageHistory` | `[{...}]` | Lịch sử tin nhắn |

## 🛡️ Bảo Mật

- Dữ liệu được sanitize để ngăn XSS attacks
- Tên người dùng được xác thực (2-20 ký tự)
- Tin nhắn được encode trước khi hiển thị

## 🚦 Trạng Thái Người Dùng

- **Green Dot** (●): Người dùng đang online
- **User Count**: Số lượng người dùng hiện tại
- **Pulse Animation**: Chỉ báo kết nối đang hoạt động

## 📱 Responsive Breakpoints

- **Desktop**: 1024px+ (Sidebar + Main Chat bên nhau)
- **Tablet**: 768px - 1024px (Sidebar cuộn ngang)
- **Mobile**: < 768px (Stack vertical, Sidebar cuộn ngang)

## ⚙️ Cấu Hình

### Thay đổi Port
Chỉnh sửa file `app.js`:
```javascript
const PORT = process.env.PORT || 3000; // Đổi 3000 thành port mong muốn
```

### Thay đổi Limit Tin Nhắn
Chỉnh sửa trong `app.js`:
```javascript
const messageHistory = []; // Có thể thêm giới hạn nếu cần
```

## 🐛 Troubleshooting

### Connection Error
- Kiểm tra server có chạy: `npm start`
- Kiểm tra port 3000 có bị chiếm dụng
- Xóa browser cache

### Tin nhắn không hiển thị
- Kiểm tra console browser (F12 → Console)
- Kiểm tra user được select
- Reload trang và thử lại

### Không thấy danh sách user
- Chắc chắn có ít nhất 2 user online
- Kiểm tra Socket.IO connection

## 🎯 Cải Tiến Tương Lai

- [ ] Lưu messages vào database (MongoDB/MySQL)
- [ ] Group chat (hơn 2 người)
- [ ] File upload/sharing
- [ ] User authentication (login/register)
- [ ] Message search
- [ ] Voice/Video call
- [ ] Emoji picker
- [ ] Message reactions
- [ ] Dark mode toggle

## 📝 License

MIT License - Tự do sử dụng cho mục đích học tập

## 👨‍💻 Developer

Tạo bởi: **Node.js Chat Team**

## 📧 Support

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra console browser (F12)
2. Kiểm tra server logs
3. Xóa browser cache và reload

---

**Happy Chatting! 💬🚀**
