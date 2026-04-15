"use client";

import { useState, useEffect } from "react";

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchReviews = async () => {
    try {
      const res = await fetch("/api/reviews");
      
      // Chống lỗi sập web do sập API
      if (!res.ok) {
        console.error("Lỗi API Reviews");
        setIsLoading(false);
        return;
      }

      const data = await res.json();
      setReviews(data);
    } catch (error) {
      console.error("Lỗi tải bình luận:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // HÀM XÓA BÌNH LUẬN RÁC
  const handleDeleteReview = async (id) => {
    const isConfirm = window.confirm("Bạn có chắc chắn muốn xóa bình luận này không?");
    
    if (isConfirm) {
      try {
        const res = await fetch(`/api/reviews/${id}`, {
          method: "DELETE"
        });

        if (res.ok) {
          alert("Đã xóa bình luận thành công!");
          fetchReviews(); // Tải lại bảng ngay lập tức
        } else {
          alert("Có lỗi xảy ra khi xóa.");
        }
      } catch (error) {
        alert("Lỗi kết nối Server!");
      }
    }
  };

  // Lọc bình luận theo nội dung hoặc tên người dùng
  const filteredReviews = reviews.filter(review => 
    review.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.userId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.userId?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.movieId?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Hàm vẽ số sao đánh giá
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <i key={i} className={`bi bi-star-fill ${i <= rating ? "text-warning" : "text-secondary opacity-25"}`} style={{ fontSize: "12px" }}></i>
      );
    }
    return <div className="d-flex gap-1">{stars}</div>;
  };

  return (
    <div className="container-fluid p-0 animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold text-dark m-0">Kiểm duyệt Bình luận</h3>
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="card-header bg-white py-3 border-bottom d-flex align-items-center justify-content-between">
          <div className="input-group" style={{ width: "350px" }}>
            <span className="input-group-text bg-light border-end-0"><i className="bi bi-search text-secondary"></i></span>
            <input 
              type="text" 
              className="form-control bg-light border-start-0 ps-0 shadow-none" 
              placeholder="Tìm theo nội dung, người dùng, phim..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <span className="badge bg-secondary bg-opacity-10 text-secondary px-3 py-2 rounded-pill fw-bold">
            Tổng: {filteredReviews.length} đánh giá
          </span>
        </div>

        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle text-dark m-0">
              <thead className="table-light text-secondary" style={{ fontSize: "14px" }}>
                <tr>
                  <th className="ps-4" style={{ width: "20%" }}>Người dùng</th>
                  <th style={{ width: "20%" }}>Phim đánh giá</th>
                  <th style={{ width: "40%" }}>Nội dung & Đánh giá</th>
                  <th className="text-end pe-4" style={{ width: "20%" }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan="4" className="text-center py-5">Đang tải dữ liệu...</td></tr>
                ) : filteredReviews.length > 0 ? (
                  filteredReviews.map(review => (
                    <tr key={review._id}>
                      <td className="ps-4">
                        <div className="fw-bold">{review.userId?.fullName || review.userId?.username || "Người dùng ẩn"}</div>
                        <small className="text-secondary">{new Date(review.createdAt).toLocaleDateString("vi-VN")} - {new Date(review.createdAt).toLocaleTimeString("vi-VN", {hour: '2-digit', minute:'2-digit'})}</small>
                      </td>
                      <td>
                        <span className="badge bg-danger bg-opacity-10 text-danger text-wrap text-start" style={{ lineHeight: "1.5" }}>
                          <i className="bi bi-film me-1"></i> {review.movieId?.title || "Phim không xác định"}
                        </span>
                      </td>
                      <td>
                        <div className="mb-1">{renderStars(review.rating || 5)}</div>
                        <p className="m-0 text-dark small" style={{ display: "-webkit-box", WebkitLineClamp: "2", WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          &quot;{review.content}&quot;
                        </p>
                      </td>
                      <td className="text-end pe-4">
                        <button 
                          onClick={() => handleDeleteReview(review._id)} 
                          className="btn btn-sm btn-outline-danger"
                          title="Xóa bình luận vi phạm"
                        >
                          <i className="bi bi-trash"></i> Xóa
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="4" className="text-center py-5 text-secondary">Không có bình luận nào.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}