const express = require('express');
const path = require('path');
const connectDB = require('./config/db');
const postRoutes = require('./routes/postRoutes');

const app = express();

// ====== Middleware ======
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ====== Database Connection ======
connectDB();

// ====== Routes ======
app.use(postRoutes);

// ====== 404 Handler ======
app.use((req, res) => {
  res.status(404).render('error', { error: 'Trang không tìm thấy' });
});

// ====== Error Handler ======
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { error: 'Lỗi server' });
});

// ====== Server Start ======
app.listen(3000, () => {
  console.log('Server đang chạy tại http://localhost:3000');
});
