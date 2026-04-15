// Đường dẫn: src/lib/db.js
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Nếu đã kết nối rồi thì không kết nối lại nữa
    if (mongoose.connection.readyState >= 1) {
      return;
    }

    // Lấy link từ biến môi trường trên Vercel, nếu không có mới dùng localhost (để chạy máy nhà)
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/TDPhim';
    
    const conn = await mongoose.connect(uri);
    
    console.log(`Đã kết nối MongoDB thành công: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Lỗi kết nối MongoDB: ${error.message}`);
    // Trên Vercel không nên dùng process.exit(1) vì sẽ làm sập cả instance
    throw new Error("Không thể kết nối đến Database");
  }
};

export default connectDB;