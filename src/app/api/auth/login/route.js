import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function POST(req) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    // 1. Tìm người dùng
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "Email không tồn tại!" }, { status: 401 });
    }

    // 2. Kiểm tra mật khẩu (Giả sử bạn dùng so sánh trực tiếp hoặc bcrypt)
    if (user.password !== password) {
      return NextResponse.json({ error: "Mật khẩu không chính xác!" }, { status: 401 });
    }

    // 🔥 QUAN TRỌNG 1: KIỂM TRA XEM CÓ BỊ KHÓA KHÔNG
    if (user.isBanned) {
      return NextResponse.json({ 
        error: "Tài khoản của bạn đã bị khóa! Vui lòng liên hệ Admin." 
      }, { status: 403 });
    }

    // 3. Trả về thông tin (Bao gồm cả role và isVip)
    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        fullName: user.fullName,
        role: user.role, // 🔥 QUAN TRỌNG 2: Gửi quyền về để Frontend biết đường mà chuyển trang
        isVip: user.isVip
      }
    });

  } catch (error) {
    return NextResponse.json({ error: "Lỗi Server" }, { status: 500 });
  }
}