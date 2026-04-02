const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BlogPostSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Tiêu đề không được để trống'],
    trim: true,
    maxlength: [200, 'Tiêu đề không được vượt quá 200 ký tự']
  },
  body: {
    type: String,
    required: [true, 'Nội dung không được để trống'],
    trim: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  tags: [{
    type: String,
    trim: true
  }],
  excerpt: {
    type: String,
    default: function() {
      return this.body.substring(0, 150) + '...';
    }
  },
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  featured: {
    type: Boolean,
    default: false
  },
  author: {
    type: String,
    default: 'Admin'
  },
  isPublished: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

const BlogPost = mongoose.model('BlogPost', BlogPostSchema);

module.exports = BlogPost;
