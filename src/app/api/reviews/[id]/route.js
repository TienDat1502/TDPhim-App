import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Review from "@/models/Review";

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    await Review.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "Đã xóa bình luận" });
  } catch (error) {
    return NextResponse.json({ error: "Lỗi Server" }, { status: 500 });
  }
}