"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

/**
 * Hàm tạo slug tiếng Việt không dấu cho URL chuẩn SEO
 */
const slugify = (text) => {
  if (!text) return "";
  return text.toString().toLowerCase()
    .replace(/á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, 'a')
    .replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, 'e')
    .replace(/i|í|ì|ỉ|ĩ|ị/gi, 'i')
    .replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, 'o')
    .replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, 'u')
    .replace(/ý|ỳ|ỷ|ỹ|ỵ/gi, 'y')
    .replace(/đ/gi, 'd')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '').replace(/-+$/, '');
};

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // Ưu tiên lấy ID thật từ localStorage
      const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
      
      // Nếu chưa đăng nhập thì đẩy thẳng ra trang login
      if (!userId) {
        router.push('/login');
        return;
      }
      
      try {
        // 1. Lấy thông tin User (Populate viewHistory)
        const resUser = await fetch(`/api/user/${userId}`);
        if (resUser.ok) {
          const userData = await resUser.json();
          setUser(userData);
        }

        // 2. Lấy lịch sử TẤT CẢ giao dịch của User
        const resTrans = await fetch(`/api/transactions`);
        if (resTrans.ok) {
          const allTransData = await resTrans.json();
          
          // Lọc ra các giao dịch của đúng userId này (có thể là object hoặc string tùy backend trả về)
          const userTransactions = allTransData.filter(tx => 
            (tx.userId?._id === userId || tx.userId === userId)
          );
          
          // Sắp xếp mới nhất lên đầu
          userTransactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          
          setTransactions(userTransactions);
        }
      } catch (err) {
        console.error("Lỗi tải thông tin hồ sơ:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  // Hàm xử lý Đăng xuất
  const handleLogout = () => {
    if (confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      localStorage.removeItem("userId"); 
      localStorage.removeItem("userRole"); 
      window.dispatchEvent(new Event("user-login")); 
      router.push("/login"); 
    }
  };

  if (isLoading) {
    return (
      <div className="vh-100 bg-black text-white d-flex align-items-center justify-content-center">
        <div className="spinner-border text-danger me-2"></div> Đang tải hồ sơ...
      </div>
    );
  }

  return (
    <div className="bg-black min-vh-100 text-white py-5 px-3">
      <div className="container">
        
        {/* TIÊU ĐỀ TRANG */}
        <div className="mb-4 border-bottom border-secondary pb-3 d-flex justify-content-between align-items-end">
          <div>
            <h2 className="fw-bold m-0"><i className="bi bi-person-circle text-danger me-2"></i>Hồ Sơ Của Tôi</h2>
            <p className="text-secondary small m-0 mt-1">Quản lý thông tin tài khoản và lịch sử giao dịch</p>
          </div>
          
          <button className="btn btn-outline-secondary btn-sm rounded-pill px-3 shadow-sm hover-white" onClick={() => alert('Chức năng đổi thông tin đang được cập nhật!')}>
            <i className="bi bi-pencil-square me-1"></i> Sửa hồ sơ
          </button>
        </div>

        <div className="row g-4">
          
          {/* CỘT TRÁI: THÔNG TIN CÁ NHÂN & LỊCH SỬ XEM GẦN ĐÂY */}
          <div className="col-lg-4">
            
            {/* THẺ USER INFO */}
            <div className="card bg-dark border-secondary p-4 text-center rounded-4 shadow mb-4">
              <div className="mx-auto bg-danger rounded-circle d-flex align-items-center justify-content-center mb-3 shadow" style={{ width: '80px', height: '80px' }}>
                <span className="fs-1 fw-bold text-white">
                  {user?.fullName?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
              <h5 className="fw-bold m-0 text-white">{user?.fullName || user?.username || "Người dùng"}</h5>
              <p className="text-secondary small mb-3">{user?.email}</p>
              
              <hr className="border-secondary opacity-25" />
              
              <div className="mb-4 text-start">
                <span className="text-secondary d-block small mb-2 text-center">Trạng thái tài khoản</span>
                {user?.isVip ? (
                  <div className="badge bg-warning text-dark px-3 py-2 fw-bold w-100 shadow-sm fs-6">
                    <i className="bi bi-crown-fill me-1"></i> THÀNH VIÊN VIP
                  </div>
                ) : (
                  <div className="badge bg-secondary px-3 py-2 w-100 opacity-75 text-center fs-6">THÀNH VIÊN THƯỜNG</div>
                )}
              </div>

              {user?.isVip && user.vipExpirationDate && (
                <div className="alert alert-warning py-2 small border-0 mb-4 mt-2 text-dark fw-medium">
                  <i className="bi bi-calendar-check me-1"></i> Hạn sử dụng: {new Date(user.vipExpirationDate).toLocaleDateString('vi-VN')}
                </div>
              )}

              {/* NÚT ĐĂNG XUẤT */}
              <button onClick={handleLogout} className="btn btn-outline-danger w-100 rounded-pill fw-bold border-2">
                <i className="bi bi-box-arrow-right me-2"></i>ĐĂNG XUẤT
              </button>
            </div>

            {/* THẺ LỊCH SỬ XEM PHIM (GIỚI HẠN 6 PHIM) */}
            <div className="card bg-dark border-secondary p-3 rounded-4 shadow">
              <div className="d-flex justify-content-between align-items-center mb-3 border-bottom border-secondary pb-2">
                <h6 className="fw-bold m-0 text-danger small text-uppercase">
                  <i className="bi bi-clock-history me-1"></i> Vừa xem
                </h6>
                <Link href="/history" className="text-secondary text-decoration-none hover-white" style={{ fontSize: '11px' }}>
                  Xem tất cả <i className="bi bi-chevron-right"></i>
                </Link>
              </div>
              
              <div className="row g-2">
                {user?.viewHistory && user.viewHistory.length > 0 ? (
                  user.viewHistory.slice(0, 6).map((item, index) => (
                    item.movieId && (
                      <div key={index} className="col-4">
                        <Link 
                          href={`/phim/${item.movieId._id}-${slugify(item.movieId.title)}`}
                          className="d-block overflow-hidden rounded shadow-sm scale-hover"
                          title={item.movieId.title}
                        >
                          <img 
                            src={item.movieId.poster} 
                            className="w-100" 
                            style={{ aspectRatio: '2/3', objectFit: 'cover' }}
                            alt={item.movieId.title}
                          />
                        </Link>
                      </div>
                    )
                  ))
                ) : (
                  <div className="col-12 py-4 text-center">
                    <i className="bi bi-film text-secondary opacity-25 fs-1 mb-2 d-block"></i>
                    <p className="text-secondary small m-0 opacity-50">Chưa có lịch sử xem</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: LỊCH SỬ GIAO DỊCH */}
          <div className="col-lg-8">
            <div className="card bg-dark border-secondary p-4 rounded-4 shadow h-100">
              <h5 className="fw-bold mb-4 d-flex align-items-center text-white border-bottom border-secondary pb-3">
                <i className="bi bi-receipt-cutoff me-2 text-danger"></i> 
                Lịch sử giao dịch
              </h5>
              
              {transactions.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-dark table-hover align-middle border-secondary mt-2">
                    <thead>
                      <tr className="text-secondary small border-secondary">
                        <th>Mã Đơn</th>
                        <th>Thời gian</th>
                        <th>Sản phẩm / Gói</th>
                        <th>Số tiền</th>
                        <th>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((t) => (
                        <tr key={t._id} className="border-secondary">
                          <td className="small text-secondary font-monospace">#{t._id.slice(-6).toUpperCase()}</td>
                          <td className="small text-light">
                            {new Date(t.createdAt).toLocaleDateString('vi-VN')} <br/>
                            <span className="text-secondary" style={{fontSize: '10px'}}>{new Date(t.createdAt).toLocaleTimeString('vi-VN')}</span>
                          </td>
                          <td className="fw-bold text-info small">
                            {t.packageId || (t.movieId ? "Mua phim lẻ" : "Nạp tiền")}
                          </td>
                          <td className="fw-bold text-white small">{t.amount?.toLocaleString('vi-VN')}đ</td>
                          <td>
                            {t.status === "Thành công" ? (
                              <span className="badge bg-success text-white px-2 py-1 shadow-sm" style={{ fontSize: '10px' }}>
                                <i className="bi bi-check-circle-fill me-1"></i>Thành công
                              </span>
                            ) : t.status === "Đang chờ" ? (
                              <span className="badge bg-warning text-dark px-2 py-1 shadow-sm" style={{ fontSize: '10px' }}>
                                <i className="bi bi-hourglass-split me-1"></i>Đang xử lý
                              </span>
                            ) : (
                              <span className="badge bg-danger text-white px-2 py-1 shadow-sm" style={{ fontSize: '10px' }}>
                                <i className="bi bi-x-circle-fill me-1"></i>Đã hủy
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-5 my-auto">
                  <div className="bg-secondary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px' }}>
                    <i className="bi bi-wallet2 fs-1 text-secondary opacity-50"></i>
                  </div>
                  <h6 className="text-light fw-bold">Chưa có giao dịch nào</h6>
                  <p className="text-secondary small m-0 mb-3">Lịch sử thanh toán mua phim lẻ hoặc nạp VIP của bạn sẽ xuất hiện ở đây.</p>
                  <Link href="/upgrade-vip" className="btn btn-warning btn-sm fw-bold rounded-pill px-4 shadow-sm me-2">
                    <i className="bi bi-gem me-1"></i> Xem các gói VIP
                  </Link>
                  <Link href="/phim-le" className="btn btn-outline-danger btn-sm fw-bold rounded-pill px-4 shadow-sm">
                    <i className="bi bi-film me-1"></i> Khám phá phim
                  </Link>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      <style jsx>{`
        .scale-hover { 
          transition: transform 0.3s ease; 
        }
        .scale-hover:hover { 
          transform: scale(1.08);
          z-index: 5;
          box-shadow: 0 5px 15px rgba(229, 9, 20, 0.4) !important;
        }
        .hover-white {
          transition: 0.2s;
        }
        .hover-white:hover {
          color: white !important;
        }
      `}</style>
    </div>
  );
}