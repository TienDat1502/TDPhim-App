import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function POST(req) {
  try {
    await connectDB();
    const { userId, movieId } = await req.json();

    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: "User không tồn tại" }, { status: 404 });

    // Kiểm tra xem phim đã có trong danh sách chưa (Dùng string để so sánh cho chuẩn)
    const isExist = user.watchlist.some(id => id.toString() === movieId);

    if (isExist) {
      // Nếu có rồi -> Xóa đi (Bấm tim lần 2)
      user.watchlist = user.watchlist.filter(id => id.toString() !== movieId);
    } else {
      // Nếu chưa có -> Thêm vào (Bấm tim lần 1)
      user.watchlist.push(movieId);
    }

    await user.save();
    return NextResponse.json({ success: true, isAdded: !isExist });
  } catch (error) {
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}