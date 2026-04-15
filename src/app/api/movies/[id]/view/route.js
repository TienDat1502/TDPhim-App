import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Movie from '@/models/Movie';

export async function POST(req, { params }) {
  try {
    await connectDB();
    const { id } = await params; // Lấy ID phim từ URL

    // Dùng lệnh $inc của MongoDB để tìm đúng phim đó và cộng thêm 1 vào cột views
    const updatedMovie = await Movie.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } }, 
      { new: true }
    );

    return NextResponse.json({ success: true, currentViews: updatedMovie.views });
  } catch (error) {
    console.error("Lỗi tăng view:", error);
    return NextResponse.json({ success: false, error: "Lỗi Server" }, { status: 500 });
  }
}