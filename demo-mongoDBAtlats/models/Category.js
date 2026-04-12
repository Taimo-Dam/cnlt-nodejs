const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CategorySchema = new Schema({
  name: {
    type: String,
    required: [true, 'Tên danh mục không được để trống'],
    unique: true,
    trim: true,
    maxlength: [50, 'Tên danh mục không được vượt quá 50 ký tự']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [300, 'Mô tả không được vượt quá 300 ký tự']
  },
  color: {
    type: String,
    default: '#c0392b'
  },
  postCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Auto generate slug from name
CategorySchema.pre('save', function(next) {
  this.slug = this.name
    .toLowerCase()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  next();
});

const Category = mongoose.model('Category', CategorySchema);

module.exports = Category;
