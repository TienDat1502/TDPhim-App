"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalMovies: 0,
    totalUsers: 0,
    revenue: 0,
    pendingOrders: 0
  });
  const [recentVipTx, setRecentVipTx] = useState([]);
  const [recentMovieTx, setRecentMovieTx] = useState([]); // State mới lưu lịch sử mua phim
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [moviesRes, usersRes, txRes] = await Promise.all([
          fetch("/api/movies?admin=true"),
          fetch("/api/user"),
          fetch("/api/transactions")
        ]);

        const movies = await moviesRes.json();
        const users = await usersRes.json();
        const transactions = await txRes.json();

        // 1. TÍNH TỔNG QUAN
        const revenue = transactions
          .filter(tx => tx.status === "Thành công")
          .reduce((sum, tx) => sum + (tx.amount || 0), 0);
        const pendingOrders = transactions.filter(tx => tx.status === "Đang chờ" || !tx.status).length;

        setStats({ 
          totalMovies: movies.length || 0, 
          totalUsers: users.length || 0, 
          revenue, 
          pendingOrders 
        });

        // 2. TÁCH DỮ LIỆU GIAO DỊCH VIP VÀ PHIM LẺ
        // Các giao dịch có chữ "Phim:" ở đầu là mua lẻ
        const vipTransactions = transactions.filter(tx => !tx.packageId?.startsWith("Phim:"));
        const movieTransactions = transactions.filter(tx => tx.packageId?.startsWith("Phim:"));

        setRecentVipTx(vipTransactions.slice(0, 5));
        setRecentMovieTx(movieTransactions.slice(0, 5)); // Lấy 5 đơn mua phim mới nhất

        // 3. XỬ LÝ BIỂU ĐỒ (Gộp toàn bộ Phim Lẻ vào chung 1 cột cho đẹp)
        const revenueByPackage = transactions
          .filter(tx => tx.status === "Thành công")
          .reduce((acc, tx) => {
            let pkgName = tx.packageId || "Gói Khác";
            if (pkgName.startsWith("Phim:")) {
                pkgName = "Doanh Thu Mua Lẻ"; // Gộp chung
            }
            if (!acc[pkgName]) acc[pkgName] = { name: pkgName, DoanhThu: 0 };
            acc[pkgName].DoanhThu += tx.amount || 0;
            return acc;
          }, {});
        
        setChartData(Object.values(revenueByPackage));

      } catch (error) {
        console.error("Lỗi tải dữ liệu Dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (value) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
    return value;
  };

  return (
    <div className="container-fluid p-0 animate-fade-in">
      <h3 className="fw-bold mb-4 text-dark">Tổng quan hệ thống</h3>
      
      {/* 4 THẺ THỐNG KÊ */}
      <div className="row g-4 mb-4">
        {/* ... (Đoạn 4 thẻ giữ nguyên như cũ để không làm dài code) ... */}
        <div className="col-xl-3 col-md-6"><div className="card border-0 shadow-sm h-100 rounded-4 overflow-hidden"><div className="card-body d-flex align-items-center justify-content-between p-4"><div><p className="text-secondary fw-medium mb-1" style={{ fontSize: "14px" }}>Tổng số Phim</p><h3 className="fw-bold m-0 text-dark">{isLoading ? "..." : stats.totalMovies}</h3></div><div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center" style={{ width: "60px", height: "60px" }}><i className="bi bi-film fs-3 text-primary"></i></div></div></div></div>
        <div className="col-xl-3 col-md-6"><div className="card border-0 shadow-sm h-100 rounded-4 overflow-hidden"><div className="card-body d-flex align-items-center justify-content-between p-4"><div><p className="text-secondary fw-medium mb-1" style={{ fontSize: "14px" }}>Khách hàng</p><h3 className="fw-bold m-0 text-dark">{isLoading ? "..." : stats.totalUsers}</h3></div><div className="bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center" style={{ width: "60px", height: "60px" }}><i className="bi bi-people-fill fs-3 text-success"></i></div></div></div></div>
        <div className="col-xl-3 col-md-6"><div className="card border-0 shadow-sm h-100 rounded-4 overflow-hidden"><div className="card-body d-flex align-items-center justify-content-between p-4"><div><p className="text-secondary fw-medium mb-1" style={{ fontSize: "14px" }}>Tổng Doanh Thu</p><h3 className="fw-bold m-0 text-dark">{isLoading ? "..." : `${stats.revenue.toLocaleString()}đ`}</h3></div><div className="bg-warning bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center" style={{ width: "60px", height: "60px" }}><i className="bi bi-wallet2 fs-3 text-warning"></i></div></div></div></div>
        <div className="col-xl-3 col-md-6"><div className="card border-0 shadow-sm h-100 rounded-4 overflow-hidden"><div className="card-body d-flex align-items-center justify-content-between p-4"><div><p className="text-secondary fw-medium mb-1" style={{ fontSize: "14px" }}>Đơn chờ duyệt</p><h3 className="fw-bold m-0 text-danger">{isLoading ? "..." : stats.pendingOrders}</h3></div><div className="bg-danger bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center" style={{ width: "60px", height: "60px" }}><i className="bi bi-hourglass-split fs-3 text-danger"></i></div></div></div></div>
      </div>

      <div className="row g-4">
        {/* CỘT TRÁI: BIỂU ĐỒ DOANH THU */}
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-header bg-white py-3 border-bottom-0">
              <h6 className="m-0 fw-bold text-dark">Phân tích Nguồn Doanh Thu</h6>
            </div>
            <div className="card-body" style={{ height: "350px" }}>
              {isLoading ? (
                <div className="d-flex align-items-center justify-content-center h-100"><span className="text-secondary">Đang tải biểu đồ...</span></div>
              ) : chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6c757d" }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6c757d" }} tickFormatter={formatCurrency} />
                    <Tooltip 
                      cursor={{ fill: 'rgba(229, 9, 20, 0.05)' }} 
                      contentStyle={{ borderRadius: "10px", border: "none", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}
                      formatter={(value) => [`${value.toLocaleString()} VNĐ`, "Doanh thu"]}
                    />
                    <Bar dataKey="DoanhThu" fill="#e50914" radius={[6, 6, 0, 0]} barSize={45} animationDuration={1500} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="d-flex align-items-center justify-content-center h-100"><span className="text-secondary">Chưa có dữ liệu.</span></div>
              )}
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: GIAO DỊCH VIP */}
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-header bg-white py-3 border-bottom-0 d-flex justify-content-between align-items-center">
              <h6 className="m-0 fw-bold text-dark">Lịch sử nâng cấp VIP</h6>
              <Link href="/admin/transactions" className="btn btn-sm btn-outline-secondary" style={{ fontSize: "12px" }}>Chi tiết</Link>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle m-0 text-dark">
                  <thead className="table-light text-secondary" style={{ fontSize: "13px" }}>
                    <tr>
                      <th className="ps-4">Khách hàng</th>
                      <th>Gói VIP</th>
                      <th className="text-end pe-4">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr><td colSpan="3" className="text-center py-4">Đang tải...</td></tr>
                    ) : recentVipTx.length > 0 ? (
                      recentVipTx.map(tx => (
                        <tr key={tx._id}>
                          <td className="ps-4">
                            <div className="fw-bold" style={{ fontSize: "14px" }}>{tx.userId?.fullName || tx.userId?.username || "Ẩn danh"}</div>
                            <small className="text-secondary" style={{ fontSize: "12px" }}>{tx.amount?.toLocaleString()}đ</small>
                          </td>
                          <td className="text-warning fw-bold" style={{ fontSize: "14px" }}>{tx.packageId}</td>
                          <td className="text-end pe-4">
                            <span className={`badge px-2 py-1 rounded-2 ${tx.status === "Thành công" ? "bg-success bg-opacity-10 text-success" : tx.status === "Đã hủy" ? "bg-danger bg-opacity-10 text-danger" : "bg-warning bg-opacity-10 text-warning"}`}>
                              {tx.status || "Đang chờ"}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="3" className="text-center py-4 text-secondary">Chưa có giao dịch.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DÒNG MỚI DƯỚI CÙNG: BẢNG LỊCH SỬ MUA PHIM LẺ */}
      <div className="card border-0 shadow-sm rounded-4 mt-4">
        <div className="card-header bg-white py-3 border-bottom-0 d-flex justify-content-between align-items-center">
          <h6 className="m-0 fw-bold text-dark"><i className="bi bi-cart-check-fill text-danger me-2"></i>Lịch sử Khách Mua Phim Lẻ</h6>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle m-0 text-dark">
              <thead className="table-light text-secondary" style={{ fontSize: "14px" }}>
                <tr>
                  <th className="ps-4">Mã Biên Lai</th>
                  <th>Khách hàng</th>
                  <th>Phim đã mua</th>
                  <th>Giá tiền</th>
                  <th className="text-end pe-4">Tình trạng</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan="5" className="text-center py-4">Đang tải dữ liệu...</td></tr>
                ) : recentMovieTx.length > 0 ? (
                  recentMovieTx.map(tx => (
                    <tr key={tx._id}>
                      <td className="ps-4 text-secondary fw-medium">#{tx._id.slice(-6).toUpperCase()}</td>
                      <td className="fw-bold text-primary">{tx.userId?.fullName || tx.userId?.username || "Ẩn danh"}</td>
                      <td className="fw-bold text-dark">{tx.packageId.replace("Phim: ", "")}</td>
                      <td className="text-danger fw-bold">{tx.amount?.toLocaleString()} VNĐ</td>
                      <td className="text-end pe-4">
                        <span className="badge bg-success px-3 py-2 rounded-pill">Đã thanh toán</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="5" className="text-center py-5 text-secondary">Chưa có ai mua phim lẻ nào.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}