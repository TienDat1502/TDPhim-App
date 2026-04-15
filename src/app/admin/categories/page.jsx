"use client";

import { useState, useEffect } from "react";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({ _id: "", name: "", description: "" });
  const [isSaving, setIsSaving] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error("Lỗi:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleOpenAdd = () => {
    setFormData({ _id: "", name: "", description: "" });
    setIsEditMode(false);
    setShowModal(true);
  };

  const handleOpenEdit = (cat) => {
    setFormData({ _id: cat._id, name: cat.name, description: cat.description || "" });
    setIsEditMode(true);
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Tạo một bản sao dữ liệu và xóa cái ID rỗng đi khi Thêm Mới
    const payload = { ...formData };
    if (!isEditMode) {
      delete payload._id; 
    }

    const url = isEditMode ? `/api/categories/${formData._id}` : "/api/categories";
    const method = isEditMode ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload) // Gửi dữ liệu đã làm sạch lên Server
      });
      if (res.ok) {
        alert(isEditMode ? "Cập nhật thành công!" : "Thêm thành công!");
        setShowModal(false);
        fetchCategories();
      } else {
        alert("Lỗi! Tên danh mục này có thể đã bị trùng với một danh mục khác.");
      }
    } catch (error) {
      alert("Lỗi kết nối Server!");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Bạn có chắc muốn xóa vĩnh viễn danh mục "${name}"?`)) {
      try {
        const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
        if (res.ok) fetchCategories();
      } catch (error) {
        alert("Lỗi kết nối!");
      }
    }
  };

  return (
    <div className="container-fluid p-0 animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold text-dark m-0">Quản lý Danh mục (Thể loại)</h3>
        <button onClick={handleOpenAdd} className="btn btn-danger fw-bold shadow-sm d-flex align-items-center gap-2">
          <i className="bi bi-plus-circle-fill"></i> Thêm Danh mục
        </button>
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle text-dark m-0">
              <thead className="table-light text-secondary">
                <tr>
                  <th className="ps-4 py-3">Tên Thể Loại</th>
                  <th>Mô tả ngắn</th>
                  <th className="text-center">Số lượng</th> 
                  <th className="text-end pe-4">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan="4" className="text-center py-5">Đang tải...</td></tr>
                ) : categories.length > 0 ? (
                  categories.map(cat => (
                    <tr key={cat._id}>
                      <td className="ps-4 fw-bold text-danger text-capitalize">{cat.name.replace(/-/g, ' ')}</td>
                      <td className="text-secondary">{cat.description || "Không có mô tả"}</td>
                      
                      {/* 👉 CỘT HIỂN THỊ SỐ LƯỢNG ĐÃ ĐƯỢC THÊM VÀO ĐÂY */}
                      <td className="text-center">
                        <span className="badge bg-info text-dark rounded-pill px-3 shadow-sm">
                          {cat.movieCount || 0} phim
                        </span>
                      </td>

                      <td className="text-end pe-4">
                        <button onClick={() => handleOpenEdit(cat)} className="btn btn-sm btn-outline-primary me-2">
                          <i className="bi bi-pencil-square"></i>
                        </button>
                        <button onClick={() => handleDelete(cat._id, cat.name)} className="btn btn-sm btn-outline-danger">
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="4" className="text-center py-5">Chưa có danh mục nào.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* KHỐI POPUP ĐÃ ĐƯỢC FIX LỖI TÀNG HÌNH CHỮ */}
      {showModal && (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header bg-light pb-2">
                <h5 className="modal-title fw-bold text-dark">
                  {isEditMode ? "Sửa Danh mục" : "Thêm Danh mục mới"}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-bold small text-dark">Tên Danh mục (VD: Hành động, Tình cảm...)</label>
                    <input 
                      type="text" 
                      className="form-control text-dark border-secondary" 
                      value={formData.name} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})} 
                      required 
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold small text-dark">Mô tả ngắn (Tùy chọn)</label>
                    <textarea 
                      className="form-control text-dark border-secondary" 
                      rows="3" 
                      value={formData.description} 
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer bg-light border-top">
                  <button type="button" className="btn btn-secondary rounded-pill px-4" onClick={() => setShowModal(false)}>Hủy</button>
                  <button type="submit" className="btn btn-danger rounded-pill px-4 fw-bold" disabled={isSaving}>
                    {isSaving ? "Đang lưu..." : "Lưu Thay Đổi"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}