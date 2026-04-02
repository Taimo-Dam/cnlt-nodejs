const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

// ========== POST ROUTES ==========

// Route để lấy tất cả bài viết (trang chủ)
router.get('/', postController.getAllPosts);

// Route để tìm kiếm bài viết
router.get('/search', postController.searchPosts);

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

// ========== COMMENT ROUTES ==========

// Route để thêm comment
router.post('/blogposts/:id/comments', postController.addComment);

// Route để xóa comment
router.post('/comments/:id/delete', postController.deleteComment);

// ========== LIKE ROUTES ==========

// Route để like/unlike bài viết
router.post('/blogposts/:id/like', postController.toggleLike);

// ========== CATEGORY ROUTES ==========

// Route để lấy bài viết theo danh mục
router.get('/category/:id', postController.getPostsByCategory);

module.exports = router;
