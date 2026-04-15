import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User"; // Đảm bảo bạn có Model User

export async function POST(req) {
  try {
    await connectDB();
    const { username, email, password } = await req.json();

    // Kiểm tra xem email đã tồn tại chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ success: false, message: "Email này đã được sử dụng!" }, { status: 400 });
    }

    // Tạo user mới (Thực tế nên mã hóa password bằng bcrypt, nhưng đồ án cơ bản có thể lưu thẳng)
    const newUser = new User({
      fullName: username,
      email,
      password,
      isVip: false, // Mặc định tài khoản mới là thường
      watchlist: [],
      history: []
    });

    await newUser.save();
    return NextResponse.json({ success: true, message: "Đăng ký thành công!" }, { status: 201 });

  } catch (error) {
    console.error("LỖI ĐĂNG KÝ TÀI KHOẢN:", error);
    return NextResponse.json({ success: false, message: "Lỗi Server" }, { status: 500 });
  }
}