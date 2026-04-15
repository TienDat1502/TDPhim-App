import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Movie from "@/models/Movie";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q"); // Lấy chữ người dùng gõ từ URL

    if (!q) {
      return NextResponse.json([]);
    }

    // ==========================================
    // 1. HÀM CHUẨN HÓA: "Lột" sạch dấu tiếng Việt
    // ==========================================
    const removeAccents = (str) => {
      if (!str) return "";
      return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d").replace(/Đ/g, "D");
    };

    const cleanQuery = removeAccents(q.toLowerCase());

    // ==========================================
    // 2. LẤY DATA (Vẫn giữ điều kiện lọc phim ẩn của bạn)
    // ==========================================
    const allVisibleMovies = await Movie.find({
      isHidden: { $ne: true } // CHÚ Ý: Đảm bảo không gợi ý mấy phim Admin đã ẩn
    }).select("title subTitle poster _id"); 

    // ==========================================
    // 3. LỌC THỦ CÔNG BẰNG JAVASCRIPT
    // ==========================================
    const filteredMovies = allVisibleMovies.filter((movie) => {
      const cleanTitle = removeAccents(movie.title.toLowerCase());
      const cleanSubTitle = removeAccents((movie.subTitle || "").toLowerCase());
      
      // So sánh không dấu
      return cleanTitle.includes(cleanQuery) || cleanSubTitle.includes(cleanQuery);
    });

    // ==========================================
    // 4. TRẢ VỀ KẾT QUẢ
    // ==========================================
    // Cắt lấy 5 phim đầu tiên y hệt như lệnh .limit(5) cũ của bạn
    return NextResponse.json(filteredMovies.slice(0, 5));

  } catch (error) {
    console.error("Lỗi tìm kiếm API:", error);
    return NextResponse.json({ message: "Lỗi Server" }, { status: 500 });
  }
}