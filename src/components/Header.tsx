/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link'; 
import SearchBar from '@/components/SearchBar'; 

// Khai báo kiểu dữ liệu chuẩn
interface UserData {
  fullName?: string;
  username?: string;
  isVip: boolean;
  watchlist: string[];
}

interface Category {
  _id: string;
  name: string;
  description?: string;
}

export default function Header() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [categories, setCategories] = useState<Category[]>([]); 
  const [isMenuOpen, setIsMenuOpen] = useState(false); 

  const fetchUser = async () => {
    const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
    if (!userId) {
      setUserData(null);
      return;
    }
    try {
      const res = await fetch(`/api/user/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setUserData(data);
      }
    } catch (err) {
      console.error("Lỗi lấy thông tin Header:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (err) {
      console.error("Lỗi lấy danh mục:", err);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchCategories(); 
    window.addEventListener('watchlist-updated', fetchUser);
    window.addEventListener('user-login', fetchUser);
    return () => {
      window.removeEventListener('watchlist-updated', fetchUser);
      window.removeEventListener('user-login', fetchUser);
    };
  }, []);

  return (
    <header className="sticky-top" style={{ zIndex: 1000 }}>
      {/* THANH THÔNG BÁO */}
      <div className="redirect-bar bg-danger text-white text-center py-1 d-none d-sm-block" style={{ fontSize: '12px' }}>
        Truy cập ➤ <Link href="/" className="text-white fw-bold">TDPhim</Link> ← để lấy link mới nhất.
      </div>

      {/* NAVBAR CHÍNH */}
      <nav className="navbar-custom bg-dark py-2 border-bottom border-secondary">
        <div className="container">
          <div className="nav-inner d-flex justify-content-between align-items-center">
            
            {/* LOGO & NÚT MENU MOBILE */}
            <div className="d-flex align-items-center gap-2">
              <button 
                className="btn text-white d-md-none p-0 me-2" 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <i className={`bi ${isMenuOpen ? 'bi-x-lg' : 'bi-list'} fs-3`}></i>
              </button>

              <Link href="/" className="brand text-decoration-none fs-4 fw-bold text-white">
                TDPhim<span className="text-danger">TV</span>
              </Link>
              
              {/* MENU CHÍNH TRÊN MÁY TÍNH (NẰM TRÊN 1 HÀNG NGANG) */}
              <div className="nav-links d-none d-xl-flex align-items-center gap-4 fw-medium ms-5" style={{ fontSize: '15px' }}>
                <Link href="/" className="text-light text-decoration-none hover-danger text-nowrap">Trang Chủ</Link>
                
                {/* HIỂN THỊ CÁC DANH MỤC LÊN HÀNG NGANG */}
                {categories.length > 0 ? (
                  categories.map((cat) => (
                    <Link 
                      key={cat._id} 
                      href={`/the-loai/${cat.name}`} 
                      className="text-light text-decoration-none hover-danger text-capitalize text-nowrap"
                    >
                      {cat.name.replace(/-/g, ' ')}
                    </Link>
                  ))
                ) : (
                  <span className="text-muted small">Đang tải...</span>
                )}
              </div>
            </div>

            {/* TÌM KIẾM, TIM & USER */}
            <div className="nav-right d-flex align-items-center gap-2 gap-md-3">
              
              <div className="d-none d-lg-block">
                <SearchBar />
              </div>

              {/* YÊU THÍCH */}
              <Link href="/watchlist" className="position-relative d-flex align-items-center text-decoration-none ms-1">
                <i className="bi bi-heart-fill fs-4 text-danger"></i>
                <span 
                  className="position-absolute translate-middle badge rounded-pill bg-white text-dark shadow-sm" 
                  style={{ fontSize: '9px', top: '2px', left: '100%', border: '1px solid #dc3545' }}
                >
                  {userData?.watchlist?.length || 0}
                </span>
              </Link>

              {/* USER / LOGIN */}
              {userData ? (
                <Link href="/profile" className="d-flex align-items-center gap-2 text-decoration-none scale-hover ms-2">
                  <div className="text-end d-none d-lg-block">
                    <div className="fw-bold text-white" style={{ fontSize: '13px', lineHeight: '1.2' }}>
                      {userData.fullName || userData.username}
                    </div>
                    {userData.isVip && (
                      <span className="badge bg-warning text-dark mt-1" style={{ fontSize: '8px', padding: '2px 4px' }}>
                         VIP
                      </span>
                    )}
                  </div>
                  <div className="bg-danger rounded-circle d-flex align-items-center justify-content-center shadow" style={{ width: '35px', height: '35px' }}>
                    <i className="bi bi-person-fill text-white fs-5"></i>
                  </div>
                </Link>
              ) : (
                <Link href="/login" className="btn btn-danger btn-sm rounded-pill px-3 fw-bold text-decoration-none shadow-sm ms-2">
                  <span className="d-none d-sm-inline">Đăng nhập</span>
                  <i className="bi bi-person-circle d-sm-none fs-5"></i>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* MENU MOBILE (Hiển thị dạng list dọc khi bấm vào nút hamburger) */}
        {isMenuOpen && (
          <div className="mobile-menu d-xl-none bg-dark border-top border-secondary p-3 animate-fade-in">
            <div className="d-flex flex-column gap-3 fs-6">
              <Link href="/" onClick={() => setIsMenuOpen(false)} className="text-white text-decoration-none border-bottom border-secondary pb-2">
                Trang Chủ
              </Link>
              
              {/* DANH SÁCH THỂ LOẠI TRÊN MOBILE */}
              {categories.map((cat) => (
                <Link 
                  key={cat._id} 
                  href={`/the-loai/${cat.name}`} 
                  onClick={() => setIsMenuOpen(false)} 
                  className="text-white text-decoration-none border-bottom border-secondary pb-2 text-capitalize"
                >
                  {cat.name.replace(/-/g, ' ')}
                </Link>
              ))}

              <div className="pt-2">
                <SearchBar />
              </div>
            </div>
          </div>
        )}
      </nav>

      <style jsx>{`
        .hover-danger:hover { color: #e50914 !important; transition: 0.2s; }
        .scale-hover:hover { transform: scale(1.05); transition: 0.2s; }
        .animate-fade-in { animation: fadeIn 0.3s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </header>
  );
}