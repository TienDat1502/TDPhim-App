"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Hàm tạo link phim chuẩn SEO (Giống trang Profile)
const slugify = (text) => {
  if (!text) return "";
  return text.toString().toLowerCase()
    .replace(/á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, 'a').replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, 'e')
    .replace(/i|í|ì|ỉ|ĩ|ị/gi, 'i').replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, 'o')
    .replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, 'u').replace(/ý|ỳ|ỷ|ỹ|ỵ/gi, 'y').replace(/đ/gi, 'd')
    .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/\-\-+/g, '-')
    .replace(/^-+/, '').replace(/-+$/, '');
};

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // Trạng thái đóng/mở bảng gợi ý
  const searchRef = useRef(null);

  // 1. Lắng nghe cú click chuột: Nếu click ra ngoài bảng tìm kiếm thì tự động đóng lại
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 2. Tự động gọi API khi gõ chữ (Có độ trễ 0.5s để chống giật lag)
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query.trim()) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      setIsOpen(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (error) {
        console.error("Lỗi tìm kiếm", error);
      } finally {
        setIsLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchSearchResults();
    }, 500); // 500ms sau khi ngừng gõ mới tìm kiếm

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // 3. Xử lý khi nhấn Enter
  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      // Đẩy sang trang danh sách phim kèm theo từ khóa (Có thể sửa đường dẫn tùy ý bạn)
      router.push(`/the-loai/phim-le?search=${encodeURIComponent(query)}`); 
    }
  };

  return (
    <div className="position-relative" ref={searchRef} style={{ width: '250px' }}>
      
      {/* Ô NHẬP LIỆU */}
      <form onSubmit={handleSubmit} className="input-group">
        <span className="input-group-text bg-black border-secondary text-secondary">
          <i className="bi bi-search"></i>
        </span>
        <input
          type="text"
          className="form-control bg-black border-secondary text-white shadow-none"
          placeholder="Tìm kiếm phim..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim() && setIsOpen(true)}
          style={{ fontSize: '14px' }}
        />
      </form>

      {/* BẢNG XỔ XUỐNG KẾT QUẢ TÌM KIẾM */}
      {isOpen && query.trim() !== "" && (
        <div 
          className="position-absolute w-100 bg-dark border border-secondary rounded-3 shadow-lg overflow-hidden mt-1"
          style={{ top: '100%', left: 0, zIndex: 1050, maxHeight: '400px', overflowY: 'auto' }}
        >
          {isLoading ? (
            <div className="text-center p-3 text-secondary small">
              <div className="spinner-border spinner-border-sm text-danger me-2" role="status"></div>
              Đang tìm kiếm...
            </div>
          ) : results.length > 0 ? (
            <div className="list-group list-group-flush">
              {results.map((movie) => (
                <Link
                  key={movie._id}
                  href={`/phim/${movie._id}-${slugify(movie.title)}`}
                  onClick={() => setIsOpen(false)} // Nhấn vào phim thì đóng bảng tìm kiếm lại
                  className="list-group-item list-group-item-action bg-dark text-white border-bottom border-secondary d-flex gap-3 align-items-center p-2 text-decoration-none"
                  style={{ transition: 'background-color 0.2s' }}
                >
                  <img 
                    src={movie.poster} 
                    alt={movie.title} 
                    className="rounded" 
                    style={{ width: '40px', height: '60px', objectFit: 'cover' }}
                  />
                  <div className="flex-grow-1 min-w-0">
                    <h6 className="mb-1 text-truncate fw-bold" style={{ fontSize: '14px' }}>{movie.title}</h6>
                    <small className="text-secondary text-truncate d-block" style={{ fontSize: '11px' }}>{movie.subTitle}</small>
                  </div>
                </Link>
              ))}
              
              {/* Nút Xem tất cả */}
              <Link 
                href={`/the-loai/phim-le?search=${encodeURIComponent(query)}`} 
                onClick={() => setIsOpen(false)}
                className="d-block text-center p-2 bg-black text-danger text-decoration-none small fw-bold hover-bg"
              >
                Xem tất cả kết quả
              </Link>
            </div>
          ) : (
            <div className="text-center p-3 text-secondary small">
              Không tìm thấy phim &quot;<span className="text-white">{query}</span>&quot;
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .list-group-item:hover { background-color: #1a1a1a !important; }
        .hover-bg:hover { background-color: #111 !important; }
      `}</style>
    </div>
  );
}