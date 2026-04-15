"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  
  const [adminName, setAdminName] = useState("Đang tải...");
  const [adminInitial, setAdminInitial] = useState("");

  const navItems = [
    { name: "Tổng quan", path: "/admin", icon: "bi-speedometer2" },
    { name: "Quản lý Phim", path: "/admin/movies", icon: "bi-film" },
    { name: "Giao dịch VIP", path: "/admin/transactions", icon: "bi-receipt" },
    { name: "Người dùng", path: "/admin/users", icon: "bi-people" },
    { name: "Danh mục", path: "/admin/categories", icon: "bi-tags" },
    { name: "Bình luận", path: "/admin/reviews", icon: "bi-chat-left-text" },
  ];

  // BẢO VỆ TRANG ADMIN BẰNG "VÍ" RIÊNG
  useEffect(() => {
    // ĐỔI THÀNH: adminRole và adminId
    const role = localStorage.getItem("adminRole");
    const adminId = localStorage.getItem("adminId");

    if (role !== "admin") {
      alert("❌ Bạn không có quyền truy cập khu vực Quản trị hệ thống!");
      router.push("/login"); // Đuổi thẳng ra trang đăng nhập
      return;
    }

    if (adminId) {
      fetch(`/api/user/${adminId}`)
        .then(res => res.json())
        .then(data => {
          if (data && !data.error) {
            const displayName = data.fullName || data.username || "Quản trị viên";
            setAdminName(displayName);
            setAdminInitial(displayName.charAt(0).toUpperCase());
          } else {
            setAdminName("Administrator");
            setAdminInitial("AD");
          }
        })
        .catch(err => {
          console.error("Lỗi tải thông tin Admin:", err);
          setAdminName("Administrator");
          setAdminInitial("AD");
        });
    }
  }, [router]);

  // HÀM XỬ LÝ ĐĂNG XUẤT (CHỈ XÓA VÍ ADMIN)
  const handleLogout = () => {
    const isConfirm = window.confirm("Bạn có chắc chắn muốn đăng xuất khỏi hệ thống quản trị?");
    if (isConfirm) {
      // Chỉ xóa vé của Admin, không động vào vé của User (nếu có)
      localStorage.removeItem("adminId");
      localStorage.removeItem("adminRole");
      
      router.push("/login");
    }
  };

  return (
    <div 
      className="d-flex" 
      style={{ 
        minHeight: "100vh", 
        backgroundColor: "#f4f6f9",
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 99999 
      }}
    >
      {/* SIDEBAR */}
      <div className="bg-dark text-white p-3 d-flex flex-column" style={{ width: "260px", height: "100%" }}>
        <Link href="/admin" className="text-decoration-none text-white d-block mb-4 text-center mt-2">
          <h3 className="fw-bold m-0">TDPhim<span className="text-danger">Admin</span></h3>
        </Link>
        <hr className="text-secondary opacity-25" />
        
        <ul className="nav nav-pills flex-column mb-auto gap-2 mt-2">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <li className="nav-item" key={item.path}>
                <Link
                  href={item.path}
                  className={`nav-link text-white d-flex align-items-center gap-3 py-2 px-3 rounded-3 ${isActive ? "bg-danger shadow" : ""}`}
                  style={{ transition: "all 0.2s ease-in-out" }}
                >
                  <i className={`bi ${item.icon} fs-5`}></i>
                  <span className="fw-medium">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
        
        <hr className="text-secondary opacity-25" />
        
        <div className="d-flex flex-column gap-2 pb-2">
          <Link href="/" className="btn btn-outline-light w-100 d-flex align-items-center justify-content-center gap-2">
            <i className="bi bi-box-arrow-left"></i> Về trang Web
          </Link>
          
          <button 
            onClick={handleLogout} 
            className="btn btn-danger fw-bold shadow-sm w-100 d-flex align-items-center justify-content-center gap-2"
          >
            <i className="bi bi-power"></i> Đăng xuất
          </button>
        </div>
      </div>

      {/* NỘI DUNG CHÍNH */}
      <div className="flex-grow-1 d-flex flex-column" style={{ overflowY: "auto" }}>
        <header className="bg-white shadow-sm p-3 d-flex justify-content-between align-items-center sticky-top">
          <h5 className="m-0 fw-bold text-dark">Hệ Thống Quản Trị</h5>
          <div className="d-flex align-items-center gap-3">
            
            <div className="d-flex align-items-center gap-2 border-start ps-3">
              <div className="bg-danger rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm" style={{ width: "35px", height: "35px" }}>
                {adminInitial}
              </div>
              <span className="fw-bold text-dark small">{adminName}</span>
            </div>
            
          </div>
        </header>

        <main className="p-4">
          {children}
        </main>
      </div>
    </div>
  );
}