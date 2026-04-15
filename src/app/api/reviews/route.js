import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Review from "@/models/Review";

// 1. LẤY DANH SÁCH BÌNH LUẬN (Dùng chung cho cả Khách và Admin)
export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const movieId = searchParams.get("movieId");

    // TRƯỜNG HỢP 1: DÀNH CHO TRANG CHI TIẾT PHIM (Khách hàng)
    if (movieId) {
      const reviews = await Review.find({ movieId })
        .populate("userId", "fullName username") 
        .sort({ createdAt: -1 }); 
      return NextResponse.json(reviews);
    } 
    
    // TRƯỜNG HỢP 2: DÀNH CHO TRANG ADMIN (Không truyền movieId -> Lấy tất cả)
    else {
      const allReviews = await Review.find()
        .populate("userId", "fullName username") 
        .populate("movieId", "title") // Admin cần biết bình luận này thuộc phim nào
        .sort({ createdAt: -1 });
      return NextResponse.json(allReviews);
    }

  } catch (error) {
    console.error("Lỗi lấy bình luận:", error);
    return NextResponse.json({ message: "Lỗi Server" }, { status: 500 });
  }
}

// 2. GỬI BÌNH LUẬN MỚI (Giữ nguyên code chuẩn của bạn)
export async function POST(req) {
  try {
    await connectDB();
    const { userId, movieId, rating, content } = await req.json();

    if (!userId || !movieId || !rating || !content) {
      return NextResponse.json({ success: false, message: "Vui lòng nhập đủ thông tin!" }, { status: 400 });
    }

    const newReview = await Review.create({ userId, movieId, rating, content });

    return NextResponse.json({ success: true, message: "Đã gửi bình luận!" });
  } catch (error) {
    console.error("Lỗi đăng bình luận:", error);
    return NextResponse.json({ success: false, message: "Lỗi Server" }, { status: 500 });
  }
}