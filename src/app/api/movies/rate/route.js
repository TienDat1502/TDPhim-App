import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Movie from '@/models/Movie';

export async function POST(req) {
  try {
    await connectDB();
    const { movieId, userId, score } = await req.json();

    const movie = await Movie.findById(movieId);
    if (!movie) return NextResponse.json({ error: "Phim không tồn tại" }, { status: 404 });

    // Kiểm tra xem user đã đánh giá chưa
    const existingRating = movie.ratings.find(r => r.userId === userId);

    if (existingRating) {
      existingRating.score = score; // Cập nhật điểm cũ
    } else {
      movie.ratings.push({ userId, score }); // Thêm đánh giá mới
    }

    // Tính lại trung bình cộng
    const total = movie.ratings.reduce((sum, r) => sum + r.score, 0);
    movie.averageRating = (total / movie.ratings.length).toFixed(1);

    await movie.save();
    return NextResponse.json({ success: true, averageRating: movie.averageRating });
  } catch (error) {
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}