// Đường dẫn: src/lib/db.js
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Nếu đã kết nối rồi thì thôi, dùng luôn
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection.asPromise();
    }
    
    const conn = await mongoose.connect('mongodb://localhost:27017/TDPhim');
    console.log(`Đã kết nối MongoDB thành công: ${conn.connection.host}`);
    
  } catch (error) {
    console.error(`Lỗi kết nối MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;