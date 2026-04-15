import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Transaction from '@/models/Transaction';
import User from '@/models/User';

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { userId, packageId, amount, paymentMethod } = body;

    // 1. Tạo biên lai (Transaction) lưu vào Database
    const newTransaction = await Transaction.create({
      userId,
      packageId,
      amount,
      paymentMethod,
      status: 'Thành công'
    });

    // 2. (Tùy chọn) Tìm User và cập nhật isVip = true
    // Đoạn này nếu bạn có User thật trong DB rồi thì mở comment ra nhé:
    /*
    await User.findByIdAndUpdate(userId, { 
      isVip: true,
      // Cộng thêm ngày hết hạn VIP vào đây...
    });
    */

    return NextResponse.json({ success: true, transaction: newTransaction });

  } catch (error) {
    console.error("Lỗi API Thanh toán:", error);
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}