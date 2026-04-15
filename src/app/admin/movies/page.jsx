"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function AdminMovies() {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchMovies = async () => {
    try {
      const res = await fetch("/api/movies?admin=true"); // Thêm ?admin=true
      const data = await res.json();
      setMovies(data);
    } catch (error) {
      console.error("Lỗi tải phim:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  // HÀM XỬ LÝ ẨN/HIỆN PHIM
  const handleToggleHide = async (movie) => {
    try {
      // Đảo ngược trạng thái hiện tại (Đang hiện -> Ẩn, Đang ẩn -> Hiện)
      const newHiddenStatus = !movie.isHidden; 
      
      const res = await fetch(`/api/movies/${movie._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isHidden: newHiddenStatus }) // Chỉ gửi đúng trường cần cập nhật
      });

      if (res.ok) {
        fetchMovies(); // Tải lại bảng để cập nhật giao diện
      } else {
        alert("Có lỗi xảy ra khi cập nhật trạng thái!");
      }
    } catch (error) {
      alert("Lỗi kết nối Server!");
    }
  };

  // HÀM XỬ LÝ XÓA PHIM
  const handleDelete = async (id, title) => {
    const isConfirm = window.confirm(`Bạn có chắc chắn muốn xóa phim "${title}" không? Hành động này không thể hoàn tác!`);
    
    if (isConfirm) {
      try {
        const res = await fetch(`/api/movies/${id}`, {
          method: "DELETE"
        });
        
        const data = await res.json();
        if (data.success) {
          alert("Đã xóa phim thành công!");
          fetchMovies(); 
        } else {
          alert("Lỗi: " + data.error);
        }
      } catch (error) {
        alert("Lỗi kết nối Server!");
      }
    }
  };

 // LỌC PHIM THÔNG MINH (CÓ HỖ TRỢ LỘT DẤU TIẾNG VIỆT)
 const filteredMovies = movies.filter(movie => {
  // 1. Hàm lột dấu
  const removeAccents = (str) => {
    if (!str) return "";
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd').replace(/Đ/g, 'D');
  };

  // 2. Chuyển từ khóa gõ vào thành không dấu + chữ thường
  const term = removeAccents(searchTerm.toLowerCase().trim());
  
  // 3. Chuyển tên phim và danh mục thành không dấu + chữ thường
  const matchTitle = removeAccents((movie.title || "").toLowerCase()).includes(term);
  const matchCategory = removeAccents((movie.category || "").toLowerCase()).replace(/-/g, ' ').includes(term);

  // Trả về kết quả nếu khớp 1 trong 2
  return matchTitle || matchCategory;
});

  return (
    <div className="container-fluid p-0 animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold text-dark m-0">Quản lý Phim</h3>
        {/* NÚT THÊM PHIM */}
        <Link href="/admin/movies/new" className="btn btn-danger fw-bold shadow-sm d-flex align-items-center gap-2">
          <i className="bi bi-plus-lg"></i> Thêm Phim Mới
        </Link>
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="card-header bg-white py-3 border-bottom d-flex align-items-center justify-content-between">
          <div className="input-group" style={{ width: "300px" }}>
            <span className="input-group-text bg-light border-end-0"><i className="bi bi-search text-secondary"></i></span>
            <input 
              type="text" 
              className="form-control bg-light border-start-0 ps-0 shadow-none" 
              placeholder="Tìm kiếm tên phim..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <span className="badge bg-danger bg-opacity-10 text-danger px-3 py-2 rounded-pill">
            Tổng: {filteredMovies.length} phim
          </span>
        </div>

        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle text-dark m-0">
              <thead className="table-light text-secondary" style={{ fontSize: "14px" }}>
                <tr>
                  <th className="ps-4">Poster</th>
                  <th>Tên phim</th>
                  <th>Trạng thái</th>
                  <th>Phân quyền</th>
                  <th className="text-end pe-4">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan="5" className="text-center py-5">Đang tải dữ liệu...</td></tr>
                ) : filteredMovies.length > 0 ? (
                  filteredMovies.map(movie => (
                    <tr key={movie._id} className={movie.isHidden ? "opacity-50" : ""}>
                      <td className="ps-4">
                        <img src={movie.poster} alt={movie.title} className="rounded shadow-sm" style={{ width: "50px", height: "70px", objectFit: "cover" }} />
                      </td>
                      <td>
                        <div className="fw-bold text-dark">{movie.title}</div>
                        <small className="text-secondary">{movie.subTitle}</small>
                      </td>
                      
                      {/* CỘT TRẠNG THÁI ẨN / HIỆN */}
                      <td>
                        {movie.isHidden ? (
                          <span className="badge bg-secondary"><i className="bi bi-eye-slash-fill me-1"></i> Đang ẩn</span>
                        ) : (
                          <span className="badge bg-success bg-opacity-10 text-success"><i className="bi bi-eye-fill me-1"></i> Hiển thị</span>
                        )}
                      </td>

                      <td>
                        {movie.price > 0 ? (
                           <span className="badge bg-danger text-white"><i className="bi bi-cash-coin me-1"></i> Mua lẻ</span>
                        ) : movie.isVip ? (
                          <span className="badge bg-warning text-dark"><i className="bi bi-crown-fill me-1"></i> VIP</span>
                        ) : (
                          <span className="badge bg-success bg-opacity-10 text-success">Miễn phí</span>
                        )}
                      </td>

                      <td className="text-end pe-4">
                        {/* NÚT SỬA */}
                        <Link href={`/admin/movies/${movie._id}`} className="btn btn-sm btn-outline-primary me-2" title="Sửa phim">
                          <i className="bi bi-pencil-square"></i>
                        </Link>
                        
                        {/* NÚT ẨN / HIỆN */}
                        <button 
                          onClick={() => handleToggleHide(movie)} 
                          className={`btn btn-sm me-2 ${movie.isHidden ? "btn-success" : "btn-outline-secondary"}`}
                          title={movie.isHidden ? "Hiện bộ phim này" : "Ẩn bộ phim này"}
                        >
                          <i className={`bi ${movie.isHidden ? "bi-eye" : "bi-eye-slash"}`}></i>
                        </button>

                        {/* NÚT XÓA */}
                        <button onClick={() => handleDelete(movie._id, movie.title)} className="btn btn-sm btn-outline-danger" title="Xóa phim">
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="5" className="text-center py-5 text-secondary">Không tìm thấy phim nào!</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}