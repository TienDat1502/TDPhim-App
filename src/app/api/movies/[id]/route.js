import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Movie from '@/models/Movie';

// 1. GET: Lấy thông tin chi tiết 1 bộ phim
export async function GET(req, { params }) {
  try {
    await connectDB();
    
    // Đảm bảo dùng await cho params trong các bản Next.js mới
    const { id } = await params; 

    // Tìm phim theo ID
    const movie = await Movie.findById(id);

    if (!movie) {
      return NextResponse.json({ error: "Phim không tồn tại" }, { status: 404 });
    }

    return NextResponse.json(movie);
  } catch (error) {
    console.error("Lỗi API Detail:", error);
    return NextResponse.json({ error: "Lỗi Server" }, { status: 500 });
  }
}

// 2. PUT: Cập nhật thông tin phim
export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await params; 
    const body = await req.json(); // Lấy dữ liệu từ form gửi lên

    const updatedMovie = await Movie.findByIdAndUpdate(id, body, { new: true });
    
    if (!updatedMovie) {
      return NextResponse.json({ error: "Không tìm thấy phim để sửa" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedMovie });
  } catch (error) {
    console.error("Lỗi Cập nhật phim:", error);
    return NextResponse.json({ error: "Lỗi Server" }, { status: 500 });
  }
}

// 3. DELETE: Xóa phim
export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await params; 
    
    const deletedMovie = await Movie.findByIdAndDelete(id);
    
    if (!deletedMovie) {
      return NextResponse.json({ error: "Không tìm thấy phim để xóa" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Đã xóa phim thành công" });
  } catch (error) {
    console.error("Lỗi Xóa phim:", error);
    return NextResponse.json({ error: "Lỗi Server" }, { status: 500 });
  }
}