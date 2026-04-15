"use client";

import { useState, useEffect } from "react";

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Trạng thái cho bộ lọc và tìm kiếm
  const [filterStatus, setFilterStatus] = useState("Tất cả");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Trạng thái để mở Popup chi tiết đơn hàng
  const [selectedTx, setSelectedTx] = useState(null);

  const fetchTransactions = async () => {
    try {
      const res = await fetch("/api/transactions");
      const data = await res.json();
      // Sắp xếp mới nhất lên đầu
      setTransactions(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (error) {
      console.error("Lỗi tải giao dịch:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // HÀM CẬP NHẬT TRẠNG THÁI (ĐƠN GIẢN HÓA)
  const handleUpdateStatus = async (id, newStatus, userName) => {
    const isConfirm = window.confirm(`Xác nhận chuyển đơn của "${userName}" thành: ${newStatus}?`);
    
    if (isConfirm) {
      try {
        const res = await fetch(`/api/transactions/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus })
        });

        if (res.ok) {
          alert(`✅ Đã cập nhật thành: ${newStatus}`);
          fetchTransactions(); // Cập nhật lại bảng ngay lập tức
          setSelectedTx(null); // Tắt popup
        } else {
          alert("❌ Lỗi: Không thể cập nhật vào Database!");
        }
      } catch (error) {
        alert("❌ Lỗi kết nối đến Server!");
      }
    }
  };

  // LOGIC TÌM KIẾM & LỌC
  const filteredTransactions = transactions.filter(tx => {
    const matchStatus = filterStatus === "Tất cả" ? true : tx.status === filterStatus;
    const searchLower = searchTerm.toLowerCase();
    const matchSearch = 
      tx._id.toLowerCase().includes(searchLower) ||
      (tx.userId?.fullName || "").toLowerCase().includes(searchLower) ||
      (tx.packageId || "").toLowerCase().includes(searchLower);

    return matchStatus && matchSearch;
  });

  return (
    <div className="container-fluid p-0 animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold text-dark m-0">Quản lý Giao Dịch</h3>
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        {/* THANH CÔNG CỤ: LỌC & TÌM KIẾM */}
        <div className="card-header bg-white py-3 border-bottom d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div className="d-flex gap-2">
            {["Tất cả", "Đang chờ", "Thành công", "Đã hủy"].map(status => (
              <button 
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`btn btn-sm rounded-pill px-3 fw-medium ${filterStatus === status ? 'btn-dark shadow-sm' : 'btn-outline-secondary'}`}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="input-group" style={{ width: "300px" }}>
            <span className="input-group-text bg-light border-end-0"><i className="bi bi-search text-secondary"></i></span>
            <input 
              type="text" 
              className="form-control bg-light border-start-0 ps-0 shadow-none" 
              placeholder="Tìm mã đơn, tên khách..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* BẢNG DANH SÁCH ĐƠN HÀNG */}
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle text-dark m-0">
              <thead className="table-light text-secondary" style={{ fontSize: "14px" }}>
                <tr>
                  <th className="ps-4">Mã Đơn</th>
                  <th>Khách hàng</th>
                  <th>Gói / Phim</th>
                  <th>Số tiền</th>
                  <th>Trạng thái</th>
                  <th className="text-end pe-4">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan="6" className="text-center py-5">Đang tải dữ liệu...</td></tr>
                ) : filteredTransactions.length > 0 ? (
                  filteredTransactions.map(tx => (
                    <tr key={tx._id}>
                      <td className="ps-4 fw-bold text-secondary" style={{ fontSize: "13px" }}>
                        #{tx._id.slice(-6).toUpperCase()}
                      </td>
                      <td>
                        <div className="fw-bold text-primary">{tx.userId?.fullName || tx.userId?.username || "Ẩn danh"}</div>
                        <small className="text-secondary">{tx.userId?.email || "Không có email"}</small>
                      </td>
                      <td>
                        <span className="fw-bold text-dark">{tx.packageId}</span>
                      </td>
                      <td className="fw-bold text-danger">{tx.amount?.toLocaleString()}đ</td>
                      <td>
                        <span className={`badge px-3 py-2 rounded-pill shadow-sm ${
                          tx.status === "Thành công" ? "bg-success" : 
                          tx.status === "Đã hủy" ? "bg-danger" : "bg-warning text-dark"
                        }`}>
                          {tx.status || "Đang chờ"}
                        </span>
                      </td>
                      <td className="text-end pe-4">
                        {/* NÚT XEM CHI TIẾT */}
                        <button 
                          onClick={() => setSelectedTx(tx)} 
                          className="btn btn-sm btn-primary fw-bold shadow-sm"
                        >
                          <i className="bi bi-eye me-1"></i> Chi tiết
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="6" className="text-center py-5 text-secondary">Không tìm thấy đơn hàng nào.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* POPUP XEM CHI TIẾT (ĐƠN GIẢN HÓA NÚT BẤM) */}
      {/* ========================================== */}
      {selectedTx && (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              
              <div className="modal-header bg-light pb-3 border-bottom-0">
                <h5 className="modal-title fw-bold text-dark">
                  Mã đơn: <span className="text-danger">#{selectedTx._id.slice(-6).toUpperCase()}</span>
                </h5>
                <button type="button" className="btn-close" onClick={() => setSelectedTx(null)}></button>
              </div>

              <div className="modal-body p-4">
                {/* HIỂN THỊ THÔNG TIN RÕ RÀNG */}
                <ul className="list-group list-group-flush mb-4 border rounded-3">
                  <li className="list-group-item d-flex justify-content-between align-items-center py-3">
                    <span className="text-secondary fw-bold">Khách hàng:</span>
                    <span className="fw-bold text-primary">{selectedTx.userId?.fullName || "Ẩn danh"}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center py-3">
                    <span className="text-secondary fw-bold">Email:</span>
                    <span>{selectedTx.userId?.email || "Không có"}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center py-3">
                    <span className="text-secondary fw-bold">Sản phẩm:</span>
                    <span className="fw-bold text-dark text-end" style={{maxWidth: "200px"}}>{selectedTx.packageId}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center py-3">
                    <span className="text-secondary fw-bold">Tổng tiền:</span>
                    <span className="fw-bold text-danger fs-5">{selectedTx.amount?.toLocaleString()} VNĐ</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center py-3">
                    <span className="text-secondary fw-bold">Tình trạng:</span>
                    <span className={`fw-bold ${selectedTx.status === "Thành công" ? "text-success" : selectedTx.status === "Đã hủy" ? "text-danger" : "text-warning"}`}>
                      {selectedTx.status || "Đang chờ"}
                    </span>
                  </li>
                </ul>

                {/* KHU VỰC 2 NÚT BẤM (DUYỆT & HỦY) */}
                <div className="d-flex flex-column gap-2">
                  <h6 className="fw-bold mb-2">Thao tác cập nhật:</h6>
                  
                  <div className="d-flex gap-2">
                    {/* NẾU CHƯA THÀNH CÔNG THÌ HIỆN NÚT DUYỆT */}
                    {selectedTx.status !== "Thành công" && (
                      <button 
                        onClick={() => handleUpdateStatus(selectedTx._id, "Thành công", selectedTx.userId?.fullName)} 
                        className="btn btn-success fw-bold py-2 flex-grow-1 shadow-sm"
                      >
                        <i className="bi bi-check-circle me-2"></i> Duyệt (Thành công)
                      </button>
                    )}

                    {/* NẾU CHƯA HỦY THÌ HIỆN NÚT HỦY */}
                    {selectedTx.status !== "Đã hủy" && (
                      <button 
                        onClick={() => handleUpdateStatus(selectedTx._id, "Đã hủy", selectedTx.userId?.fullName)} 
                        className="btn btn-danger fw-bold py-2 flex-grow-1 shadow-sm"
                      >
                        <i className="bi bi-x-circle me-2"></i> Từ chối (Hủy đơn)
                      </button>
                    )}
                  </div>
                  
                  <button onClick={() => setSelectedTx(null)} className="btn btn-light border fw-bold py-2 mt-2">
                    Đóng cửa sổ
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}