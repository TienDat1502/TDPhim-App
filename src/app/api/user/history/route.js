import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function POST(req) {
  try {
    await connectDB();
    const { userId, movieId } = await req.json();

    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: "User không tồn tại" }, { status: 404 });

    // 1. Xóa phim này khỏi mảng cũ nếu đã có (để tránh trùng lặp)
    user.viewHistory = user.viewHistory.filter(item => 
      item.movieId && item.movieId.toString() !== movieId
    );

    // 2. Thêm vào vị trí đầu tiên (Mới xem nhất)
    user.viewHistory.unshift({ movieId, watchedAt: new Date() });

    // 3. Giới hạn chỉ lưu 10 phim gần nhất cho nhẹ Database
    if (user.viewHistory.length > 10) user.viewHistory.pop();

    await user.save();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Lỗi Server" }, { status: 500 });
  }
}