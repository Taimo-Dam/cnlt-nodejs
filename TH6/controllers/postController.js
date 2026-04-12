const BlogPost = require('../models/BlogPost');
const Comment = require('../models/Comment');
const Category = require('../models/Category');

// ========== POST FUNCTIONS ==========

/**
 * Lấy danh sách tất cả bài viết (sắp xếp theo ngày tạo giảm dần)
 */
const getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 6;
    const skip = (page - 1) * limit;
    const searchQuery = req.query.search || '';
    const categoryId = req.query.category || '';
    const sortBy = req.query.sort || '-createdAt';

    // Build filter
    let filter = { isPublished: true };
    if (searchQuery) {
      filter.$or = [
        { title: { $regex: searchQuery, $options: 'i' } },
        { body: { $regex: searchQuery, $options: 'i' } },
        { tags: { $regex: searchQuery, $options: 'i' } }
      ];
    }
    if (categoryId) {
      filter.category = categoryId;
    }

    // Get posts with pagination
    const posts = await BlogPost.find(filter)
      .populate('category')
      .sort(sortBy)
      .skip(skip)
      .limit(limit)
      .lean();

    const totalPosts = await BlogPost.countDocuments(filter);
    const totalPages = Math.ceil(totalPosts / limit);

    // Get categories for sidebar
    const categories = await Category.find().lean();

    res.render('index', {
      posts,
      categories,
      currentPage: page,
      totalPages,
      searchQuery,
      selectedCategory: categoryId,
      totalPosts
    });
  } catch (error) {
    console.log('Lỗi lấy danh sách bài viết:', error);
    res.status(500).render('error', { error: 'Lỗi server' });
  }
};

/**
 * Hiển thị form tạo bài viết mới
 */
const getCreateForm = async (req, res) => {
  try {
    const categories = await Category.find().lean();
    res.render('create', { categories });
  } catch (error) {
    console.log('Lỗi hiển thị form tạo bài viết:', error);
    res.status(500).render('error', { error: 'Lỗi server' });
  }
};

/**
 * Tạo bài viết mới
 */
const createPost = async (req, res) => {
  try {
    const { title, body, category, tags, featured } = req.body;

    if (!title || !body) {
      return res.status(400).render('error', { error: 'Tiêu đề và nội dung không được để trống' });
    }

    const tagsArray = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

    const newPost = await BlogPost.create({
      title: title.trim(),
      body: body.trim(),
      category: category || null,
      tags: tagsArray,
      featured: featured === 'on' ? true : false,
      excerpt: body.trim().substring(0, 150) + '...'
    });

    // Update category post count
    if (category) {
      await Category.findByIdAndUpdate(category, { $inc: { postCount: 1 } });
    }

    res.redirect('/');
  } catch (error) {
    console.log('Lỗi tạo bài viết:', error);
    res.status(500).render('error', { error: 'Lỗi server' });
  }
};

/**
 * Xem chi tiết bài viết
 */
const getPostDetail = async (req, res) => {
  try {
    const post = await BlogPost.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate('category')
      .populate({ path: 'comments', match: { approved: true } });

    if (!post) {
      return res.status(404).render('error', { error: 'Bài viết không tìm thấy' });
    }

    // Get related posts (same category or tags)
    const relatedPosts = await BlogPost.find({
      _id: { $ne: post._id },
      $or: [
        { category: post.category },
        { tags: { $in: post.tags } }
      ]
    })
      .limit(3)
      .lean();

    const categories = await Category.find().lean();

    res.render('detail', { post, relatedPosts, categories });
  } catch (error) {
    console.log('Lỗi lấy chi tiết bài viết:', error);
    res.status(500).render('error', { error: 'Lỗi server' });
  }
};

/**
 * Hiển thị form sửa bài viết
 */
const getEditForm = async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id).populate('category');
    const categories = await Category.find().lean();

    if (!post) {
      return res.status(404).render('error', { error: 'Bài viết không tìm thấy' });
    }

    res.render('edit', { post, categories });
  } catch (error) {
    console.log('Lỗi hiển thị form sửa bài viết:', error);
    res.status(500).render('error', { error: 'Lỗi server' });
  }
};

/**
 * Cập nhật bài viết
 */
const updatePost = async (req, res) => {
  try {
    const { title, body, category, tags, featured } = req.body;

    if (!title || !body) {
      return res.status(400).render('error', { error: 'Tiêu đề và nội dung không được để trống' });
    }

    const tagsArray = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

    // Get old post to check category change
    const oldPost = await BlogPost.findById(req.params.id);

    const post = await BlogPost.findByIdAndUpdate(
      req.params.id,
      {
        title: title.trim(),
        body: body.trim(),
        category: category || null,
        tags: tagsArray,
        featured: featured === 'on' ? true : false,
        excerpt: body.trim().substring(0, 150) + '...'
      },
      { new: true }
    );

    if (!post) {
      return res.status(404).render('error', { error: 'Bài viết không tìm thấy' });
    }

    // Update category counts if changed
    if (oldPost.category?.toString() !== (category || null)) {
      if (oldPost.category) {
        await Category.findByIdAndUpdate(oldPost.category, { $inc: { postCount: -1 } });
      }
      if (category) {
        await Category.findByIdAndUpdate(category, { $inc: { postCount: 1 } });
      }
    }

    res.redirect(`/blogposts/${req.params.id}`);
  } catch (error) {
    console.log('Lỗi cập nhật bài viết:', error);
    res.status(500).render('error', { error: 'Lỗi server' });
  }
};

/**
 * Xóa bài viết
 */
const deletePost = async (req, res) => {
  try {
    const post = await BlogPost.findByIdAndDelete(req.params.id);

    if (!post) {
      return res.status(404).render('error', { error: 'Bài viết không tìm thấy' });
    }

    // Update category post count
    if (post.category) {
      await Category.findByIdAndUpdate(post.category, { $inc: { postCount: -1 } });
    }

    // Delete associated comments
    if (post.comments && post.comments.length > 0) {
      await Comment.deleteMany({ _id: { $in: post.comments } });
    }

    res.redirect('/');
  } catch (error) {
    console.log('Lỗi xóa bài viết:', error);
    res.status(500).render('error', { error: 'Lỗi server' });
  }
};

// ========== COMMENT FUNCTIONS ==========

/**
 * Thêm comment cho bài viết
 */
const addComment = async (req, res) => {
  try {
    const { content, author, email } = req.body;
    const postId = req.params.id;

    if (!content || !author || !email) {
      return res.status(400).render('error', { error: 'Vui lòng điền đầy đủ thông tin' });
    }

    const comment = await Comment.create({
      content: content.trim(),
      author: author.trim(),
      email: email.trim(),
      post: postId
    });

    // Add comment to post
    await BlogPost.findByIdAndUpdate(postId, { $push: { comments: comment._id } });

    res.redirect(`/blogposts/${postId}?comment=success`);
  } catch (error) {
    console.log('Lỗi thêm comment:', error);
    res.status(500).render('error', { error: 'Lỗi server' });
  }
};

/**
 * Xóa comment
 */
const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findByIdAndDelete(req.params.id);

    if (!comment) {
      return res.status(404).json({ error: 'Comment không tìm thấy' });
    }

    // Remove comment from post
    await BlogPost.findByIdAndUpdate(comment.post, { $pull: { comments: comment._id } });

    res.redirect(`/blogposts/${comment.post}`);
  } catch (error) {
    console.log('Lỗi xóa comment:', error);
    res.status(500).render('error', { error: 'Lỗi server' });
  }
};

// ========== LIKE FUNCTIONS ==========

/**
 * Like/Unlike bài viết
 */
const toggleLike = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.session?.userId || req.ip; // Use IP as user ID if no session

    const post = await BlogPost.findById(postId);

    if (!post) {
      return res.status(404).json({ error: 'Bài viết không tìm thấy' });
    }

    const likeIndex = post.likes.indexOf(userId);

    if (likeIndex !== -1) {
      // Unlike
      post.likes.splice(likeIndex, 1);
    } else {
      // Like
      post.likes.push(userId);
    }

    await post.save();

    res.json({ likes: post.likes.length, liked: likeIndex === -1 });
  } catch (error) {
    console.log('Lỗi like bài viết:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// ========== CATEGORY FUNCTIONS ==========

/**
 * Lấy bài viết theo danh mục
 */
const getPostsByCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = 6;
    const skip = (page - 1) * limit;

    const category = await Category.findById(categoryId);

    if (!category) {
      return res.status(404).render('error', { error: 'Danh mục không tìm thấy' });
    }

    const posts = await BlogPost.find({ category: categoryId, isPublished: true })
      .populate('category')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .lean();

    const totalPosts = await BlogPost.countDocuments({ category: categoryId, isPublished: true });
    const totalPages = Math.ceil(totalPosts / limit);
    const categories = await Category.find().lean();

    res.render('category', {
      category,
      posts,
      categories,
      currentPage: page,
      totalPages,
      totalPosts
    });
  } catch (error) {
    console.log('Lỗi lấy bài viết theo danh mục:', error);
    res.status(500).render('error', { error: 'Lỗi server' });
  }
};

// ========== SEARCH FUNCTION ==========

/**
 * Tìm kiếm bài viết
 */
const searchPosts = async (req, res) => {
  try {
    const query = req.query.q || '';
    const page = parseInt(req.query.page) || 1;
    const limit = 6;
    const skip = (page - 1) * limit;

    if (!query) {
      return res.redirect('/');
    }

    const searchFilter = {
      isPublished: true,
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { body: { $regex: query, $options: 'i' } },
        { tags: { $regex: query, $options: 'i' } }
      ]
    };

    const posts = await BlogPost.find(searchFilter)
      .populate('category')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .lean();

    const totalPosts = await BlogPost.countDocuments(searchFilter);
    const totalPages = Math.ceil(totalPosts / limit);
    const categories = await Category.find().lean();

    res.render('search', {
      posts,
      categories,
      searchQuery: query,
      currentPage: page,
      totalPages,
      totalPosts
    });
  } catch (error) {
    console.log('Lỗi tìm kiếm:', error);
    res.status(500).render('error', { error: 'Lỗi server' });
  }
};

module.exports = {
  getAllPosts,
  getCreateForm,
  createPost,
  getPostDetail,
  getEditForm,
  updatePost,
  deletePost,
  addComment,
  deleteComment,
  toggleLike,
  getPostsByCategory,
  searchPosts
};
