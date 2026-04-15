import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Movie from "@/models/Movie";
import Transaction from "@/models/Transaction";

export async function POST(req) {
  try {
    await connectDB();
    const { userId, movieId } = await req.json();

    const movie = await Movie.findById(movieId);
    if (!movie) return NextResponse.json({ error: "Không tìm thấy phim!" }, { status: 404 });

    // ==========================================
    // BƯỚC CHẶN SPAM: Kiểm tra đơn hàng trùng lặp
    // ==========================================
    const pendingTx = await Transaction.findOne({
      userId: userId,
      movieId: movieId,
      status: "Đang chờ"
    });

    // Nếu tìm thấy có đơn đang chờ rồi -> Chặn luôn, trả về cờ isPending = true
    if (pendingTx) {
      return NextResponse.json({ 
        success: false, 
        isPending: true, // Gửi báo hiệu cho Frontend biết để khóa nút bấm
        error: "Bạn đã gửi yêu cầu mua phim này rồi. Vui lòng chờ Admin duyệt nhé!" 
      });
    }

    // Nếu chưa có đơn nào đang chờ -> Mới tạo đơn mới
    await Transaction.create({
      userId: userId,
      movieId: movieId, // Lưu lại ID phim
      packageId: `Phim: ${movie.title}`, 
      amount: movie.price,
      status: "Đang chờ"
    });

    return NextResponse.json({ success: true, message: "Đã gửi yêu cầu mua phim!" });
  } catch (error) {
    console.error("Lỗi mua phim:", error);
    return NextResponse.json({ error: "Lỗi Server khi mua phim" }, { status: 500 });
  }
}