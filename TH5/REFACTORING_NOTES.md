# 📋 Ghi chú Tái cấu trúc (Refactoring Notes)

## 🔄 So sánh TH4 vs TH5

### TH4 - Cấu trúc cũ (Monolithic)

```
TH4/
├── app.js                          ⚠️ Tất cả code trong 1 file
├── models/BlogPost.js              Model riêng
├── views/                          Views
└── package.json
```

**Vấn đề**:
- Tất cả routes, middleware, database connection trong `app.js` (56 dòng code)
- Khó bảo trì khi dự án phát triển
- Khó test từng phần
- Database connection logic trộn lẫn với server config

### TH5 - Cấu trúc mới (MVC + Modules)

```
TH5/
├── app.js                          ✅ Chỉ config server (19 dòng)
├── config/db.js                    ✅ Database riêng
├── models/BlogPost.js              ✅ Model
├── controllers/postController.js   ✅ Business logic
├── routes/postRoutes.js            ✅ Routes riêng
├── views/                          ✅ Views
├── public/                         ✅ Static assets
└── package.json
```

**Lợi ích**:
- Separation of Concerns (Tách biệt chức năng)
- Single Responsibility Principle (Mỗi module một trách nhiệm)
- Dễ test, dễ bảo trì, dễ mở rộng
- Code sạch và dễ đọc

---

## 📊 Chi tiết Thay đổi

### 1. app.js

#### TH4 (Cũ):
```javascript
const express = require('express');
const mongoose = require('mongoose');
const BlogPost = require('./models/BlogPost');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// ❌ Database connection logic trộn lẫn
mongoose.connect('mongodb://127.0.0.1:27017/blogDB')
  .then(() => console.log('Kết nối MongoDB thành công'))
  .catch((error) => console.log('Lỗi kết nối MongoDB:', error));

// ❌ Tất cả routes trong app.js
app.get('/', async (req, res) => {
  const posts = await BlogPost.find({}).sort({ createdAt: -1 });
  res.render('index', { posts });
});
// ... 40+ dòng routes

app.listen(3000, () => {
  console.log('Server đang chạy tại http://localhost:3000');
});
```

#### TH5 (Mới):
```javascript
const express = require('express');
const connectDB = require('./config/db');          // ✅ Import module DB
const postRoutes = require('./routes/postRoutes'); // ✅ Import routes

const app = express();

// ====== Middleware ======
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', './views');

// ====== Database Connection ======
connectDB();                                        // ✅ Gọi module DB

// ====== Routes ======
app.use(postRoutes);                              // ✅ Sử dụng routes module

// ====== Server Start ======
app.listen(3000, () => {
  console.log('Server đang chạy tại http://localhost:3000');
});
```

**Cải tiến**:
- ✅ Chỉ 19 dòng
- ✅ Rõ ràng về mục đích từng phần
- ✅ Dễ thêm middleware mới
- ✅ Dễ thay đổi config

---

### 2. config/db.js (NEW)

**TH5 (Mới)** - Tách riêng database connection logic:

```javascript
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/blogDB');
    console.log('Kết nối MongoDB thành công');
  } catch (error) {
    console.log('Lỗi kết nối MongoDB:', error);
    process.exit(1);                              // ✅ Exit nếu không kết nối
  }
};

module.exports = connectDB;
```

**Lợi ích**:
- ✅ Có thể tái sử dụng
- ✅ Dễ thay đổi connection string
- ✅ Bắt lỗi tốt hơn
- ✅ Dễ test

---

### 3. controllers/postController.js (NEW)

**TH5 (Mới)** - Tách logic xử lý từ routes:

```javascript
// TH5 trong postController.js
const getAllPosts = async (req, res) => {
  try {
    const posts = await BlogPost.find({}).sort({ createdAt: -1 });
    res.render('index', { posts });
  } catch (error) {
    console.log('Lỗi lấy danh sách bài viết:', error);
    res.status(500).send('Lỗi server');
  }
};

const createPost = async (req, res) => {
  try {
    const { title, body } = req.body;
    
    if (!title || !body) {
      return res.status(400).send('Tiêu đề và nội dung không được để trống');
    }

    await BlogPost.create({
      title: title.trim(),
      body: body.trim()
    });

    res.redirect('/');
  } catch (error) {
    console.log('Lỗi tạo bài viết:', error);
    res.status(500).send('Lỗi server');
  }
};

// ... 6 functions khác
```

**Lợi ích**:
- ✅ Mỗi function xử lý 1 tác vụ
- ✅ Có thể tái sử dụng
- ✅ Dễ test từng function
- ✅ Error handling rõ ràng
- ✅ Thêm validation input

---

### 4. routes/postRoutes.js (NEW)

**TH5 (Mới)** - Tách routes:

```javascript
const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

// Route để lấy tất cả bài viết (trang chủ)
router.get('/', postController.getAllPosts);

// Route để hiển thị form tạo bài viết
router.get('/blogposts/new', postController.getCreateForm);

// Route để tạo bài viết
router.post('/blogposts/store', postController.createPost);

// ... 4 routes khác

module.exports = router;
```

**Lợi ích**:
- ✅ Routes tập trung 1 chỗ
- ✅ Dễ thêm/xóa routes
- ✅ Dễ thêm middleware riêng
- ✅ Có thể sử dụng nhiều router

---

### 5. models/BlogPost.js

**Không thay đổi**:
```javascript
// TH4 và TH5 giống nhau
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BlogPostSchema = new Schema({
  title: String,
  body: String
}, { timestamps: true });

const BlogPost = mongoose.model('BlogPost', BlogPostSchema);

module.exports = BlogPost;
```

---

### 6. Views (EJS Templates)

**Không thay đổi chức năng**, chỉ cải thiện CSS:
- index.ejs - Danh sách bài viết
- create.ejs - Form tạo
- detail.ejs - Chi tiết bài viết
- edit.ejs - Form sửa

---

## 📈 Metrics Cải tiến

| Tiêu chỉ | TH4 | TH5 | Cải tiến |
|----------|-----|-----|---------|
| **Dòng code trong app.js** | 56 | 19 | ⬇️ 66% |
| **Số files** | 8 | 14 | ⬆️ Modular |
| **Reusability** | Thấp | Cao | ⬆️ |
| **Testability** | Khó | Dễ | ⬆️ |
| **Maintainability** | Khó | Dễ | ⬆️ |

---

## 🎯 Design Patterns Sử dụng

### 1. MVC Pattern
- **Model** (models/BlogPost.js) - Dữ liệu
- **View** (views/*.ejs) - Giao diện
- **Controller** (controllers/postController.js) - Logic xử lý

### 2. Module Pattern
- Mỗi file là 1 module độc lập
- Export/Import rõ ràng
- Dễ thay thế hoặc extend

### 3. Separation of Concerns
- Database logic riêng (config/db.js)
- Business logic riêng (controllers/)
- Routing logic riêng (routes/)
- View logic riêng (views/)

---

## 🚀 Cách mở rộng trong tương lai

### Thêm feature mới dễ dàng:

1. **Thêm comment cho bài viết**:
   - Tạo `models/Comment.js`
   - Tạo controller functions `getComments()`, `createComment()`
   - Thêm routes mới
   - Update views

2. **Thêm user authentication**:
   - Tạo `config/auth.js`
   - Tạo middleware `auth/verifyToken.js`
   - Thêm `models/User.js`
   - Thêm routes auth riêng
   - Thêm controller auth riêng

3. **Thêm category cho bài viết**:
   - Tạo `models/Category.js`
   - Tạo `controllers/categoryController.js`
   - Thêm routes category riêng
   - Update views

---

## ✅ Checklist Refactoring

- [x] Tách database connection thành module riêng
- [x] Tách routes thành file riêng
- [x] Tách business logic thành controller
- [x] Giữ nguyên Models
- [x] Giữ nguyên Views
- [x] Giữ nguyên chức năng
- [x] Thêm error handling
- [x] Thêm input validation
- [x] Cập nhật package.json
- [x] Tạo README chi tiết
- [x] Test tất cả chức năng

---

## 🔧 Hướng dẫn sử dụng từng module

### Sử dụng database:
```javascript
const connectDB = require('./config/db');
connectDB(); // Kết nối database
```

### Sử dụng controller:
```javascript
const postController = require('./controllers/postController');
// Trong routes:
router.get('/', postController.getAllPosts);
```

### Sử dụng routes:
```javascript
const postRoutes = require('./routes/postRoutes');
app.use(postRoutes); // Sử dụng tất cả routes
```

---

**Kết luận**: TH5 là phiên bản cải tiến của TH4 với cấu trúc chuyên nghiệp, dễ bảo trì, và sẵn sàng cho việc mở rộng thêm tính năng.
