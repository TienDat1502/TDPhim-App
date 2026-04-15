"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function ReviewSection({ movieId }) {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(10);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/reviews?movieId=${movieId}`);
      const data = await res.json();
      setReviews(data);
    } catch (err) {
      console.error("Lỗi tải bình luận", err);
    }
  };

  useEffect(() => {
    if (movieId) fetchReviews();
  }, [movieId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return alert("Vui lòng nhập nội dung bình luận!");

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, movieId, rating, content })
      });
      const data = await res.json();

      if (data.success) {
        setContent(""); 
        setRating(10);  
        fetchReviews(); 
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-4 border-top border-secondary pt-4">
      <h5 className="fw-bold mb-3 text-white">
        <i className="bi bi-chat-text-fill text-danger me-2"></i>Bình luận & Đánh giá
      </h5>

      {/* FORM VIẾT BÌNH LUẬN ĐƯỢC LÀM GỌN */}
      {userId ? (
        <form onSubmit={handleSubmit} className="mb-4">
          <textarea 
            className="form-control bg-dark text-white border-secondary shadow-none mb-2" 
            style={{ fontSize: '14px', resize: 'none' }}
            rows="2" 
            placeholder="Để lại bình luận và đánh giá của bạn..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          ></textarea>
          
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-2">
              <span className="text-secondary" style={{ fontSize: '13px' }}>Đánh giá:</span>
              <select 
                className="form-select form-select-sm bg-dark text-warning border-secondary shadow-none" 
                style={{ width: 'auto', fontSize: '13px', fontWeight: 'bold' }}
                value={rating} 
                onChange={(e) => setRating(Number(e.target.value))}
              >
                {[10,9,8,7,6,5,4,3,2,1].map(num => (
                  <option key={num} value={num}>{num} Sao ⭐️</option>
                ))}
              </select>
            </div>
            
            <button type="submit" className="btn btn-danger btn-sm fw-bold px-4 rounded-pill" disabled={isSubmitting}>
              {isSubmitting ? "Đang gửi..." : "Gửi"}
            </button>
          </div>
        </form>
      ) : (
        <div className="alert bg-dark text-secondary border-secondary py-2 px-3 mb-4 text-center" style={{ fontSize: '14px' }}>
          Vui lòng <Link href="/login" className="text-danger fw-bold text-decoration-none">Đăng nhập</Link> để tham gia bình luận.
        </div>
      )}

      {/* DANH SÁCH BÌNH LUẬN LÀM GỌN (Bỏ khung đen dày) */}
      <div className="d-flex flex-column gap-3">
        {reviews.length > 0 ? (
          reviews.map((rev) => (
            <div key={rev._id} className="d-flex gap-3 pb-3 border-bottom border-secondary border-opacity-25">
              <div className="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold flex-shrink-0" style={{ width: '40px', height: '40px', fontSize: '15px' }}>
                {rev.userId?.fullName?.charAt(0) || rev.userId?.username?.charAt(0) || "U"}
              </div>
              <div>
                <div className="d-flex align-items-center gap-2 mb-1">
                  <span className="fw-bold text-light" style={{ fontSize: '14px' }}>{rev.userId?.fullName || rev.userId?.username || "Người dùng"}</span>
                  <span className="badge bg-warning text-dark" style={{ fontSize: '10px', padding: '3px 5px' }}><i className="bi bi-star-fill me-1"></i> {rev.rating}</span>
                  <small className="text-secondary" style={{ fontSize: '11px' }}>
                    {new Date(rev.createdAt).toLocaleDateString('vi-VN')}
                  </small>
                </div>
                <p className="text-light m-0" style={{ fontSize: '13.5px', lineHeight: '1.5' }}>{rev.content}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-secondary py-3" style={{ fontSize: '14px' }}>
            Chưa có bình luận nào. Hãy là người đầu tiên đánh giá phim này!
          </div>
        )}
      </div>
    </div>
  );
}