"use client";

import { useState, useEffect } from "react";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // States cho Popup Thêm/Sửa
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    _id: "", fullName: "", username: "", email: "", phone: "", password: "", isVip: false, role: "user"
  });
  const [isSaving, setIsSaving] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/user");
      const data = await res.json();
      setUsers(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (error) {
      console.error("Lỗi tải người dùng:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // HÀM TÍNH SỐ NGÀY CÒN LẠI CỦA VIP
  const calculateDaysLeft = (expirationDate) => {
    if (!expirationDate) return 0;
    const now = new Date();
    const exp = new Date(expirationDate);
    const diffTime = exp - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // HÀM MỞ POPUP THÊM MỚI
  const handleOpenAdd = () => {
    setFormData({ _id: "", fullName: "", username: "", email: "", phone: "", password: "", isVip: false, role: "user" });
    setIsEditMode(false);
    setShowModal(true);
  };

  // HÀM MỞ POPUP SỬA
  const handleOpenEdit = (user) => {
    setFormData({
      _id: user._id,
      fullName: user.fullName || "",
      username: user.username || "",
      email: user.email || "",
      phone: user.phone || "",
      password: "", // Không hiển thị pass cũ
      isVip: user.isVip || false,
      role: user.role || "user"
    });
    setIsEditMode(true);
    setShowModal(true);
  };

  // HÀM LƯU (THÊM HOẶC SỬA)
  const handleSaveUser = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    const url = isEditMode ? `/api/user/${formData._id}` : "/api/user";
    const method = isEditMode ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        alert(isEditMode ? "Cập nhật thành công!" : "Đã thêm tài khoản mới!");
        setShowModal(false);
        fetchUsers();
      } else {
        const errorData = await res.json();
        alert("Lỗi: " + (errorData.error || "Không thể lưu dữ liệu"));
      }
    } catch (error) {
      alert("Lỗi kết nối Server!");
    } finally {
      setIsSaving(false);
    }
  };

  // HÀM KHÓA / MỞ KHÓA TÀI KHOẢN
  const handleToggleBan = async (user) => {
    if (user.role === 'admin') {
      const confirmAdmin = window.confirm("CẢNH BÁO: Đây là tài khoản Quản trị viên (Admin). Bạn có chắc chắn muốn khóa người này không?");
      if (!confirmAdmin) return;
    }

    const action = user.isBanned ? "MỞ KHÓA" : "KHÓA";
    const isConfirm = window.confirm(`Bạn có chắc muốn ${action} tài khoản "${user.fullName || user.username}"?`);
    
    if (isConfirm) {
      try {
        const res = await fetch(`/api/user/${user._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isBanned: !user.isBanned })
        });
        if (res.ok) fetchUsers();
      } catch (error) { alert("Lỗi kết nối!"); }
    }
  };

  // HÀM XÓA TÀI KHOẢN
  const handleDelete = async (user) => {
    if (user.role === 'admin') {
      alert("LỖI: Không thể tự ý xóa tài khoản Admin. Vui lòng hạ quyền họ xuống Khách hàng trước khi xóa!");
      return;
    }

    if (window.confirm(`XÓA VĨNH VIỄN tài khoản "${user.fullName || user.username}"? Hành động này không thể hoàn tác!`)) {
      try {
        const res = await fetch(`/api/user/${user._id}`, { method: "DELETE" });
        if (res.ok) fetchUsers();
      } catch (error) { alert("Lỗi kết nối!"); }
    }
  };

  // Lọc tìm kiếm
  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (user.fullName || "").toLowerCase().includes(searchLower) ||
      (user.username || "").toLowerCase().includes(searchLower) ||
      (user.email || "").toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="container-fluid p-0 animate-fade-in position-relative">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold text-dark m-0">Quản lý Khách hàng</h3>
        <button onClick={handleOpenAdd} className="btn btn-danger fw-bold shadow-sm d-flex align-items-center gap-2">
          <i className="bi bi-person-plus-fill"></i> Thêm Tài khoản
        </button>
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="card-header bg-white py-3 border-bottom d-flex align-items-center justify-content-between">
          <div className="input-group" style={{ width: "350px" }}>
            <span className="input-group-text bg-light border-end-0"><i className="bi bi-search text-secondary"></i></span>
            <input 
              type="text" 
              className="form-control bg-light border-start-0 ps-0 shadow-none" 
              placeholder="Tìm theo tên, username hoặc email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill fw-bold">
            Tổng cộng: {filteredUsers.length} tài khoản
          </span>
        </div>

        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle text-dark m-0">
              <thead className="table-light text-secondary" style={{ fontSize: "14px" }}>
                <tr>
                  <th className="ps-4">Người dùng</th>
                  <th>Liên hệ</th>
                  <th>Vai trò</th>
                  <th>Quyền lợi</th>
                  <th>Tình trạng</th>
                  <th className="text-end pe-4">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan="6" className="text-center py-5">Đang tải dữ liệu...</td></tr>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map(user => (
                    <tr key={user._id} className={user.isBanned ? "opacity-75 bg-light" : ""}>
                      <td className="ps-4">
                        <div className="d-flex align-items-center gap-3">
                          <div className={`rounded-circle d-flex align-items-center justify-content-center text-white fw-bold ${user.isBanned ? 'bg-secondary' : user.role === 'admin' ? 'bg-danger' : 'bg-dark'}`} style={{ width: "40px", height: "40px", fontSize: "18px" }}>
                            {(user.fullName || user.username || "U").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className={`fw-bold ${user.isBanned ? 'text-secondary text-decoration-line-through' : 'text-dark'}`}>
                              {user.fullName || user.username || "Chưa cập nhật"}
                            </div>
                            <small className="text-secondary">@{user.username || "user"}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="small"><i className="bi bi-envelope me-2 text-secondary"></i>{user.email || "Chưa có"}</div>
                        <div className="small mt-1"><i className="bi bi-telephone me-2 text-secondary"></i>{user.phone || "Chưa có"}</div>
                      </td>
                      
                      <td>
                        {user.role === 'admin' ? (
                          <span className="badge bg-danger text-white px-2 py-1"><i className="bi bi-shield-lock-fill me-1"></i> Admin</span>
                        ) : (
                          <span className="badge bg-secondary bg-opacity-10 text-dark px-2 py-1"><i className="bi bi-person-fill me-1"></i> Khách hàng</span>
                        )}
                      </td>

                      {/* CỘT QUYỀN LỢI ĐÃ ĐƯỢC CẬP NHẬT */}
                      <td className="align-middle">
                        {user.isVip ? (
                          <div>
                            <span className="badge bg-warning text-dark mb-1 shadow-sm"><i className="bi bi-crown-fill me-1"></i> VIP</span>
                            <br />
                            <small className={calculateDaysLeft(user.vipExpirationDate) < 3 ? "text-danger fw-bold" : "text-muted"}>
                              {calculateDaysLeft(user.vipExpirationDate) > 0 
                                ? `Còn ${calculateDaysLeft(user.vipExpirationDate)} ngày` 
                                : "Đã hết hạn"}
                            </small>
                          </div>
                        ) : (
                          <span className="badge bg-light text-secondary border px-2 py-1">Thường</span>
                        )}
                      </td>

                      <td>
                        {user.isBanned ? (
                           <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-2 py-1"><i className="bi bi-lock-fill me-1"></i> Bị Khóa</span>
                        ) : (
                           <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1"><i className="bi bi-check-circle-fill me-1"></i> Hoạt động</span>
                        )}
                      </td>
                      <td className="text-end pe-4">
                        <button onClick={() => handleOpenEdit(user)} className="btn btn-sm btn-outline-primary me-2" title="Sửa thông tin">
                          <i className="bi bi-pencil-square"></i>
                        </button>
                        <button 
                          onClick={() => handleToggleBan(user)} 
                          className={`btn btn-sm me-2 ${user.isBanned ? "btn-success" : "btn-outline-warning"}`}
                          title={user.isBanned ? "Mở khóa tài khoản" : "Khóa tài khoản"}
                        >
                          <i className={`bi ${user.isBanned ? "bi-unlock-fill" : "bi-lock-fill"}`}></i>
                        </button>
                        <button onClick={() => handleDelete(user)} className="btn btn-sm btn-outline-danger" title="Xóa vĩnh viễn">
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="6" className="text-center py-5 text-secondary">Không tìm thấy tài khoản nào.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden animate-fade-in">
              <div className="modal-header bg-light border-bottom-0 pb-2">
                <h5 className="modal-title fw-bold text-dark">
                  {isEditMode ? "Chỉnh sửa Tài khoản" : "Thêm Tài khoản mới"}
                </h5>
                <button type="button" className="btn-close shadow-none" onClick={() => setShowModal(false)}></button>
              </div>

              <form onSubmit={handleSaveUser}>
                <div className="modal-body p-4 pt-2">
                  <div className="mb-4 p-3 bg-danger bg-opacity-10 border border-danger border-opacity-25 rounded-3">
                    <label className="form-label fw-bold text-danger mb-2"><i className="bi bi-shield-lock-fill me-1"></i> Vai trò hệ thống</label>
                    <select className="form-select fw-bold text-dark" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
                      <option value="user">Khách hàng (User)</option>
                      <option value="admin">Quản trị viên (Admin)</option>
                    </select>
                  </div>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-bold small">Họ và Tên</label>
                      <input type="text" className="form-control" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} placeholder="Nguyễn Văn A" required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold small">Username</label>
                      <input type="text" className="form-control" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} placeholder="nguyenvana123" required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold small">Email</label>
                      <input type="email" className="form-control" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="email@example.com" required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold small">Mật khẩu {isEditMode && <span className="text-secondary fw-normal">(Để trống để giữ nguyên)</span>}</label>
                      <input type="password" className="form-control" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder="********" required={!isEditMode} />
                    </div>
                  </div>
                  
                  <div className="form-check form-switch mt-4 p-3 bg-light rounded-3 border">
                    <input className="form-check-input ms-0 me-2" type="checkbox" id="vipSwitch" checked={formData.isVip} onChange={(e) => setFormData({...formData, isVip: e.target.checked})} />
                    <label className="form-check-label fw-bold text-warning" htmlFor="vipSwitch">
                      <i className="bi bi-crown-fill me-1"></i> Cấp quyền VIP Member
                    </label>
                  </div>
                </div>

                <div className="modal-footer bg-light border-top-0 pt-0">
                  <button type="button" className="btn btn-secondary px-4 rounded-pill" onClick={() => setShowModal(false)}>Hủy</button>
                  <button type="submit" className="btn btn-danger px-4 rounded-pill fw-bold shadow-sm" disabled={isSaving}>
                    {isSaving ? "Đang xử lý..." : "Lưu Thay Đổi"}
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