import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Transaction from "@/models/Transaction";
import User from "@/models/User"; // Import User để lấy tên người mua

export async function GET() {
  try {
    await connectDB();
    // Lấy tất cả giao dịch, ghép thêm thông tin (tên, username) từ bảng User
    const transactions = await Transaction.find()
      .populate("userId", "fullName username email")
      .sort({ createdAt: -1 });
    return NextResponse.json(transactions);
  } catch (error) {
    return NextResponse.json({ message: "Lỗi Server" }, { status: 500 });
  }
}