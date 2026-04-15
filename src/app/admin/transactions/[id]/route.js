import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Transaction from "@/models/Transaction";
import User from "@/models/User";

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const { status } = await req.json();

    const transaction = await Transaction.findById(id);
    if (!transaction) return NextResponse.json({ error: "Không tìm thấy giao dịch" }, { status: 404 });

    // Cập nhật trạng thái mới
    transaction.status = status;
    await transaction.save();

    // ============================================
    // LOGIC TỰ ĐỘNG XỬ LÝ (MỞ KHÓA PHIM / CẤP VIP)
    // ============================================
    
    // 1. NẾU LÀ ĐƠN MUA PHIM LẺ (Có lưu movieId)
    if (transaction.movieId) {
      if (status === "Thành công") {
        // Duyệt đơn: Nhét phim vào túi của Khách
        await User.findByIdAndUpdate(transaction.userId, { $addToSet: { purchasedMovies: transaction.movieId } });
      } else if (status === "Đã hủy" || status === "Đang chờ") {
        // Hủy đơn: Rút phim khỏi túi của Khách
        await User.findByIdAndUpdate(transaction.userId, { $pull: { purchasedMovies: transaction.movieId } });
      }
    } 
    // 2. NẾU LÀ ĐƠN NẠP GÓI VIP
    else {
      if (status === "Thành công") {
        
        let expireDate = new Date(); // Lấy thời gian hiện tại
        
        // KIỂM TRA ĐÚNG TÊN GÓI TỪ FRONTEND ĐỂ CỘNG THỜI GIAN
        if (transaction.packageId === 'Gói Test 30s') {
          // Cộng 30 GIÂY
          expireDate.setSeconds(expireDate.getSeconds() + 30);
          
        } else if (transaction.packageId === 'Gói 1 Tháng') {
          // Cộng 30 NGÀY
          expireDate.setDate(expireDate.getDate() + 30);
          
        } else if (transaction.packageId === 'Gói 6 Tháng') {
          // Cộng 6 THÁNG
          expireDate.setMonth(expireDate.getMonth() + 6);
          
        } else if (transaction.packageId === 'Gói 1 Năm') {
          // Cộng 1 NĂM
          expireDate.setFullYear(expireDate.getFullYear() + 1);
        }

        // Bật VIP và gán thời gian hết hạn
        await User.findByIdAndUpdate(transaction.userId, { 
          isVip: true,
          vipExpiresAt: expireDate // Thêm dòng này để tính ngày hết hạn
        });

      } else if (status === "Đã hủy" || status === "Đang chờ") {
        // Tước VIP nếu hủy
        await User.findByIdAndUpdate(transaction.userId, { 
          isVip: false,
          vipExpiresAt: null // Xóa luôn hạn
        });
      }
    }

    return NextResponse.json({ success: true, message: "Cập nhật thành công!" });
  } catch (error) {
    console.error("Lỗi cập nhật đơn hàng:", error);
    return NextResponse.json({ error: "Lỗi Server" }, { status: 500 });
  }
}