import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Transaction from "@/models/Transaction";

export async function POST(req) {
  try {
    await connectDB();
    const { userId, packageId, amount, months } = await req.json();

    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ success: false, message: "Không tìm thấy user" }, { status: 404 });

    // 1. Tính toán ngày hết hạn VIP (Cộng dồn nếu đang là VIP)
    let currentExp = user.vipExpirationDate && new Date(user.vipExpirationDate) > new Date() 
                     ? new Date(user.vipExpirationDate) 
                     : new Date();
    
    currentExp.setMonth(currentExp.getMonth() + months);

    // 2. Cập nhật User thành VIP
    user.isVip = true;
    user.vipExpirationDate = currentExp;
    await user.save();

    // 3. Tạo lịch sử giao dịch (Đơn hàng đã mua)
    await Transaction.create({
      userId,
      packageId,
      amount,
      status: "Thành công"
    });

    return NextResponse.json({ success: true, message: "Nâng cấp VIP thành công!" });
  } catch (error) {
    console.error("LỖI THANH TOÁN:", error);
    return NextResponse.json({ success: false, message: "Lỗi Server" }, { status: 500 });
  }
}