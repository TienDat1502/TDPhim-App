import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";

// GET: Lấy danh sách TẤT CẢ người dùng cho trang Admin
export async function GET() {
  try {
    await connectDB();
    // Lấy tất cả user, sắp xếp mới nhất lên đầu, và ẩn mật khẩu đi
    const users = await User.find().sort({ createdAt: -1 }).select("-password");
    return NextResponse.json(users);
  } catch (error) {
    console.error("Lỗi lấy danh sách User:", error);
    return NextResponse.json({ message: "Lỗi Server" }, { status: 500 });
  }
}
// Thêm đoạn này vào DƯỚI CÙNG của file src/app/api/user/route.js hiện tại của bạn

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    // Kiểm tra xem Username hoặc Email đã tồn tại chưa
    const existingUser = await User.findOne({ 
      $or: [{ email: body.email }, { username: body.username }] 
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email hoặc Username đã được sử dụng!" }, { status: 400 });
    }

    // Tạo tài khoản mới (Gắn cờ role, isVip... theo Admin chọn)
    const newUser = await User.create(body);

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error("Lỗi tạo User:", error);
    return NextResponse.json({ error: "Lỗi Server khi tạo tài khoản" }, { status: 500 });
  }
}
