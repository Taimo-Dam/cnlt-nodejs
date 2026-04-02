const express = require('express');
const connectDB = require('./config/db');
const postRoutes = require('./routes/postRoutes');

const app = express();

// ====== Middleware ======
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', './views');

// ====== Database Connection ======
connectDB();

// ====== Routes ======
app.use(postRoutes);

// ====== Server Start ======
app.listen(3000, () => {
  console.log('Server đang chạy tại http://localhost:3000');
});