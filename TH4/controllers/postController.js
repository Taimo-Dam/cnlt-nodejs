const BlogPost = require('../models/BlogPost');

/**
 * Lấy danh sách tất cả bài viết (sắp xếp theo ngày tạo giảm dần)
 */
const getAllPosts = async (req, res) => {
  try {
    const posts = await BlogPost.find({}).sort({ createdAt: -1 });
    res.render('index', { posts });
  } catch (error) {
    console.log('Lỗi lấy danh sách bài viết:', error);
    res.status(500).send('Lỗi server');
  }
};

/**
 * Hiển thị form tạo bài viết mới
 */
const getCreateForm = (req, res) => {
  try {
    res.render('create');
  } catch (error) {
    console.log('Lỗi hiển thị form tạo bài viết:', error);
    res.status(500).send('Lỗi server');
  }
};

/**
 * Tạo bài viết mới
 */
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

/**
 * Xem chi tiết bài viết
 */
const getPostDetail = async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    
    if (!post) {
      return res.status(404).send('Bài viết không tìm thấy');
    }

    res.render('detail', { post });
  } catch (error) {
    console.log('Lỗi lấy chi tiết bài viết:', error);
    res.status(500).send('Lỗi server');
  }
};

/**
 * Hiển thị form sửa bài viết
 */
const getEditForm = async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    
    if (!post) {
      return res.status(404).send('Bài viết không tìm thấy');
    }

    res.render('edit', { post });
  } catch (error) {
    console.log('Lỗi hiển thị form sửa bài viết:', error);
    res.status(500).send('Lỗi server');
  }
};

/**
 * Cập nhật bài viết
 */
const updatePost = async (req, res) => {
  try {
    const { title, body } = req.body;
    
    if (!title || !body) {
      return res.status(400).send('Tiêu đề và nội dung không được để trống');
    }

    const post = await BlogPost.findByIdAndUpdate(
      req.params.id,
      {
        title: title.trim(),
        body: body.trim()
      },
      { new: true }
    );

    if (!post) {
      return res.status(404).send('Bài viết không tìm thấy');
    }

    res.redirect(`/blogposts/${req.params.id}`);
  } catch (error) {
    console.log('Lỗi cập nhật bài viết:', error);
    res.status(500).send('Lỗi server');
  }
};

/**
 * Xóa bài viết
 */
const deletePost = async (req, res) => {
  try {
    const post = await BlogPost.findByIdAndDelete(req.params.id);
    
    if (!post) {
      return res.status(404).send('Bài viết không tìm thấy');
    }

    res.redirect('/');
  } catch (error) {
    console.log('Lỗi xóa bài viết:', error);
    res.status(500).send('Lỗi server');
  }
};

module.exports = {
  getAllPosts,
  getCreateForm,
  createPost,
  getPostDetail,
  getEditForm,
  updatePost,
  deletePost
};
