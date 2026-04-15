"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";

export default function EditMoviePage({ params }) {
  const router = useRouter();
  const { id } = use(params); // Lấy ID từ URL
  const isNew = id === "new";

  // 1. STATE LƯU TRỮ DANH MỤC TỪ DATABASE
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    subTitle: "",
    poster: "",
    videoUrl: "",
    category: "", // Sửa mặc định thành rỗng để ép chọn danh mục
    year: 2024,
    badge: "", // Sửa lại thành rỗng
    isVip: false,
    price: 0,
    description: "Đang cập nhật nội dung..."
  });

  const [isSaving, setIsSaving] = useState(false);

  // 2. TỰ ĐỘNG LẤY DANH MỤC TỪ DB KHI VỪA MỞ TRANG
  useEffect(() => {
    fetch("/api/categories")
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error("Lỗi load danh mục:", err));
  }, []);

  // 3. LẤY THÔNG TIN PHIM NẾU LÀ CHẾ ĐỘ SỬA
  useEffect(() => {
    if (!isNew) {
      fetch(`/api/movies/${id}`)
        .then(res => res.json())
        .then(data => {
          setFormData({
            title: data.title || "",
            subTitle: data.subTitle || "",
            poster: data.poster || "",
            videoUrl: data.videoUrl || "",
            category: data.category || "",
            year: data.year || 2024,
            badge: data.badge || "",
            isVip: data.isVip || false,
            price: data.price || 0,
            description: data.description || "Đang cập nhật nội dung..."
          });
        })
        .catch(err => console.error("Lỗi load phim", err));
    }
  }, [id, isNew]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    let finalValue = value;
    if (type === "checkbox") {
      finalValue = checked;
    } else if (type === "number") {
      finalValue = value === "" ? "" : Number(value);
    }

    setFormData(prev => ({
      ...prev,
      [name]: finalValue
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    const method = isNew ? "POST" : "PUT";
    const url = isNew ? "/api/movies" : `/api/movies/${id}`;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        alert(isNew ? "Thêm phim thành công!" : "Cập nhật thành công!");
        router.push("/admin/movies");
        router.refresh();
      } else {
        const errData = await res.json();
        alert("Thất bại: " + (errData.error || "Có lỗi xảy ra khi lưu vào Database!"));
      }
    } catch (error) {
      alert("Lỗi hệ thống, vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container-fluid p-0 animate-fade-in">
      <div className="d-flex align-items-center gap-3 mb-4">
        <button type="button" onClick={() => router.back()} className="btn btn-light shadow-sm rounded-circle">
          <i className="bi bi-arrow-left"></i>
        </button>
        <h3 className="fw-bold m-0">{isNew ? "Thêm Phim Mới" : "Chỉnh Sửa Phim"}</h3>
      </div>

      <form onSubmit={handleSubmit} className="row g-4">
        {/* CỘT TRÁI: THÔNG TIN CƠ BẢN */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 p-4">
            <div className="mb-3">
              <label className="form-label fw-bold">Tiêu đề phim</label>
              <input type="text" name="title" className="form-control" value={formData.title ?? ""} onChange={handleChange} required placeholder="Ví dụ: Vincenzo" />
            </div>
            <div className="mb-3">
              <label className="form-label fw-bold">Tiêu đề phụ (Tiếng Anh/Gốc)</label>
              <input type="text" name="subTitle" className="form-control" value={formData.subTitle ?? ""} onChange={handleChange} placeholder="Ví dụ: Reborn Rich" />
            </div>
            <div className="mb-3">
              <label className="form-label fw-bold">Mô tả phim</label>
              <textarea name="description" className="form-control" rows="5" value={formData.description ?? ""} onChange={handleChange}></textarea>
            </div>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">Link Video (Iframe/Embed)</label>
                <input type="text" name="videoUrl" className="form-control" value={formData.videoUrl ?? ""} onChange={handleChange} required placeholder="Link phim..." />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">Link Ảnh Poster</label>
                <input type="text" name="poster" className="form-control" value={formData.poster ?? ""} onChange={handleChange} required placeholder="Link ảnh..." />
              </div>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: PHÂN LOẠI, TRẠNG THÁI & GIÁ BÁN */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
            <h6 className="fw-bold mb-3 border-bottom pb-2 text-danger">Phân loại & Thuộc tính</h6>
            
            <div className="mb-3">
              <label className="form-label fw-bold text-success">
                <i className="bi bi-cash-coin me-1"></i> Giá mua lẻ (VNĐ)
              </label>
              <input 
                type="number" 
                name="price" 
                className="form-control border-success fw-bold text-success" 
                value={formData.price ?? 0} 
                onChange={handleChange} 
                placeholder="Nhập 0 nếu miễn phí..."
                min="0"
              />
              <small className="text-secondary d-block mt-1">Để 0đ nếu là phim miễn phí hoặc nằm trong gói VIP.</small>
            </div>

            <div className="mb-3">
              <label className="form-label small fw-bold">Danh mục <span className="text-danger">*</span></label>
              {/* 👉 ĐÂY CHÍNH LÀ Ô DROPDOWN ĐÃ ĐƯỢC KẾT NỐI DATABASE */}
              <select 
                name="category" 
                className="form-select border-secondary text-capitalize" 
                value={formData.category ?? ""} 
                onChange={handleChange}
                required
              >
                <option value="" disabled>-- Bấm để chọn danh mục --</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.name}>
                    {cat.name.replace(/-/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-3">
              <label className="form-label small">Năm phát hành</label>
              <input type="number" name="year" className="form-control" value={formData.year ?? 2024} onChange={handleChange} />
            </div>
            <div className="mb-3">
              <label className="form-label small">Thể loại phụ (Hành động, Tình cảm...)</label>
              <input type="text" name="badge" className="form-control" value={formData.badge ?? ""} onChange={handleChange} placeholder="Ví dụ: Hành Động" />
            </div>
            <div className="form-check form-switch mt-4 p-3 bg-light rounded-3 border">
              <input className="form-check-input ms-0 me-2" type="checkbox" name="isVip" checked={formData.isVip ?? false} onChange={handleChange} id="vipSwitch" />
              <label className="form-check-label fw-bold text-warning" htmlFor="vipSwitch">
                <i className="bi bi-crown-fill me-1"></i> Yêu cầu thẻ VIP
              </label>
            </div>
          </div>

          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
            <button type="submit" disabled={isSaving} className="btn btn-danger btn-lg fw-bold w-100 py-3 rounded-pill shadow">
              {isSaving ? (
                <span><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Đang xử lý...</span>
              ) : (isNew ? "Đăng Phim Ngay" : "Lưu Thay Đổi")}
            </button>
            <button type="button" onClick={() => router.back()} className="btn btn-link text-secondary text-decoration-none w-100 mt-2">Hủy bỏ</button>
          </div>
        </div>
      </form>
    </div>
  );
}