import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params; // Đợi params cho Next.js 15
    
    const user = await User.findById(id)
    .select("-password")
    .populate('viewHistory.movieId');
    
    if (!user) {
      return NextResponse.json({ error: "User không tồn tại" }, { status: 404 });
    }

    // ⏳ LOGIC THU HỒI VIP TỰ ĐỘNG (LAZY CHECK)
    // 👉 Đã sửa lại thành vipExpiresAt để khớp với Database và API Admin
    if (user.isVip && user.vipExpiresAt) {
      const now = new Date();
      // Nếu ngày hiện tại vượt quá ngày hết hạn
      if (now > user.vipExpiresAt) {
        user.isVip = false;           // Tước VIP
        user.vipExpiresAt = null;     // Xóa hạn
        await user.save();            // Lưu đè vào Database ngay lập tức
      }
    }
    
    return NextResponse.json(user);
  } catch (error) {
    console.error("Lỗi GET User:", error);
    return NextResponse.json({ error: "Lỗi Server" }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    // Nếu lúc sửa mà quản trị viên không nhập Pass mới -> Xóa trường pass đi để không bị đè pass rỗng vào DB
    if (!body.password || body.password.trim() === "") {
      delete body.password;
    } else {
      // (Nếu đồ án của bạn có dùng mã hóa bcrypt thì hash password ở đây)
      // body.password = bcrypt.hashSync(body.password, 10);
    }

    // Cập nhật thông tin người dùng (Bao gồm cả việc đổi isBanned và role)
    const updatedUser = await User.findByIdAndUpdate(id, body, { new: true });
    
    if (!updatedUser) {
      return NextResponse.json({ error: "Không tìm thấy tài khoản!" }, { status: 404 });
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Lỗi cập nhật User:", error);
    return NextResponse.json({ error: "Lỗi Server khi cập nhật tài khoản" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    // Chặn xóa tài khoản Admin (Bảo mật 2 lớp cả FE lẫn BE)
    const user = await User.findById(id);
    if (user && user.role === 'admin') {
      return NextResponse.json({ error: "Không thể xóa tài khoản Quản trị viên!" }, { status: 403 });
    }

    await User.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: "Đã xóa tài khoản thành công!" });
  } catch (error) {
    console.error("Lỗi xóa User:", error);
    return NextResponse.json({ error: "Lỗi Server khi xóa tài khoản" }, { status: 500 });
  }
}