const express = require('express');
const mongoose = require('mongoose');
const BlogPost = require('./models/BlogPost');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

mongoose.connect('mongodb://127.0.0.1:27017/blogDB')
  .then(() => console.log('Kết nối MongoDB thành công'))
  .catch((error) => console.log('Lỗi kết nối MongoDB:', error));

app.get('/', async (req, res) => {
  const posts = await BlogPost.find({}).sort({ createdAt: -1 });
  res.render('index', { posts });
});

app.get('/blogposts/new', (req, res) => {
  res.render('create');
});

app.post('/blogposts/store', async (req, res) => {
  await BlogPost.create({
    title: req.body.title,
    body: req.body.body
  });
  res.redirect('/');
});

app.get('/blogposts/:id', async (req, res) => {
  const post = await BlogPost.findById(req.params.id);
  res.render('detail', { post });
});

app.get('/blogposts/:id/edit', async (req, res) => {
  const post = await BlogPost.findById(req.params.id);
  res.render('edit', { post });
});

app.post('/blogposts/:id/update', async (req, res) => {
  await BlogPost.findByIdAndUpdate(req.params.id, {
    title: req.body.title,
    body: req.body.body
  });
  res.redirect(`/blogposts/${req.params.id}`);
});

app.post('/blogposts/:id/delete', async (req, res) => {
  await BlogPost.findByIdAndDelete(req.params.id);
  res.redirect('/');
});

app.listen(3000, () => {
  console.log('Server đang chạy tại http://localhost:3000');
});