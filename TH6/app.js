require('dotenv').config();

const express = require('express');
const path = require('path');
const connectDB = require('./config/db');
const postRoutes = require('./routes/postRoutes');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

connectDB();
app.use(postRoutes);
app.use((req, res) => {
  res.status(404).render('error', { error: 'Trang không tìm thấy' });
});
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { error: 'Lỗi server' });
});
app.listen(3000, () => {
  console.log('Server đang chạy tại http://localhost:3000');
});
