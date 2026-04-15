import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Transaction from "@/models/Transaction";

export async function POST(req) {
  try {
    await connectDB();
    const { userId, packageId, amount } = await req.json();

    if (!userId || !packageId) {
      return NextResponse.json({ error: "Thiếu thông tin giao dịch!" }, { status: 400 });
    }

    // Tạo đơn hàng nạp VIP với trạng thái "Đang chờ"
    await Transaction.create({
      userId,
      packageId, // Tên gói (Ví dụ: Gói 1 Tháng)
      amount,    // Số tiền
      status: "Đang chờ",
      type: "VIP"
    });

    return NextResponse.json({ 
      success: true, 
      message: "Đơn hàng đã được tạo, vui lòng chờ Admin duyệt!" 
    });

  } catch (error) {
    console.error("Lỗi khi mua VIP:", error);
    return NextResponse.json({ error: "Lỗi Server" }, { status: 500 });
  }
}