const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.error('MISSING_ENV: Vui lòng cấu hình biến môi trường MONGO_URI trong tệp .env');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Kết nối MongoDB thành công');
  } catch (error) {
    console.error('❌ Lỗi kết nối MongoDB:', error.message || error);
    process.exit(1);
  }
};

module.exports = connectDB; // ← Dòng này quan trọng, thiếu là lỗi ngay