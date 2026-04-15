import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Category from "@/models/Category";
import Movie from "@/models/Movie"; // Bổ sung Model Movie để đếm phim

export async function GET() {
  try {
    await connectDB();
    
    // 1. Lấy danh sách toàn bộ danh mục dưới dạng Object thuần (.lean())
    const categories = await Category.find().sort({ createdAt: -1 }).lean();

    // 2. Chạy vòng lặp đi đếm số phim cho từng danh mục
    const categoriesWithCount = await Promise.all(categories.map(async (cat) => {
      // Đếm những phim có category bằng với tên danh mục hiện tại
      const count = await Movie.countDocuments({ category: cat.name });
      return { ...cat, movieCount: count }; // Gắn thêm con số vào dữ liệu trả về
    }));

    return NextResponse.json(categoriesWithCount);
  } catch (error) {
    console.error("Lỗi đếm danh mục:", error);
    return NextResponse.json({ error: "Lỗi Server" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const newCategory = await Category.create(body);
    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Tên danh mục có thể đã tồn tại!" }, { status: 400 });
  }
}