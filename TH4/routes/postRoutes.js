const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

// Route để lấy tất cả bài viết (trang chủ)
router.get('/', postController.getAllPosts);

// Route để hiển thị form tạo bài viết
router.get('/blogposts/new', postController.getCreateForm);

// Route để tạo bài viết
router.post('/blogposts/store', postController.createPost);

// Route để xem chi tiết bài viết
router.get('/blogposts/:id', postController.getPostDetail);

// Route để hiển thị form sửa bài viết
router.get('/blogposts/:id/edit', postController.getEditForm);

// Route để cập nhật bài viết
router.post('/blogposts/:id/update', postController.updatePost);

// Route để xóa bài viết
router.post('/blogposts/:id/delete', postController.deletePost);

module.exports = router;
