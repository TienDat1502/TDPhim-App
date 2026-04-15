"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import styles from "@/app/phimLe.module.css"; 
import MovieCard from "@/components/MovieCard";
import TrendingCard from "@/components/TrendingCard";

const genres = ["Tất Cả", "Hành Động", "Tình Cảm", "Hài Hước", "Cổ Trang", "Tâm Lý", "Kinh Dị", "Hoạt Hình"];
const countries = ["Quốc gia", "Việt Nam", "Hàn Quốc", "Trung Quốc", "Âu Mỹ", "Nhật Bản", "Thái Lan"];
const years = ["Năm", "2024", "2023", "2022", "2021", "2020", "2019"];

// Hàm hỗ trợ hiển thị tên danh mục chuẩn
const getCategoryName = (slug) => {
  switch (slug) {
    case 'phim-bo': return 'Phim Bộ';
    case 'phim-le': return 'Phim Lẻ';
    case 'phim-chieu-rap': return 'Phim Chiếu Rạp';
    default: return 'Danh Sách Phim';
  }
};

export default function MovieListPage({ params }) {
  const { slug } = use(params); // Lấy slug từ URL (phim-le, phim-bo, hoặc phim-chieu-rap)
  
  const [moviesData, setMoviesData] = useState([]);
  const [trendingData, setTrendingData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedGenre, setSelectedGenre] = useState("Tất Cả");
  const [selectedCountry, setSelectedCountry] = useState("Quốc gia");
  const [selectedYear, setSelectedYear] = useState("Năm");
  
  // Khai báo state và biến cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 978; 
  const pageNumbers = [1, 2, 3, 4]; 

  const searchParams = useSearchParams();
  const searchKeyword = searchParams.get("search") || "";

  // 1. KHI NGƯỜI DÙNG CHỌN BỘ LỌC -> TỰ ĐỘNG VỀ TRANG 1
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedGenre, selectedCountry, selectedYear, searchKeyword]);

  // 2. GỌI API LẤY PHIM TỪ DATABASE
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoading(true);
        let dbCategory = slug;
        if (slug === 'phim-chieu-rap') {
            dbCategory = 'chieu-rap'; // Sửa thành 'Phim Chiếu Rạp' nếu DB bạn lưu có dấu
        } else if (slug === 'phim-le') {
            dbCategory = 'phim-le'; 
        } else if (slug === 'phim-bo') {
            dbCategory = 'phim-bo'; 
        }
        
        // Gọi API lấy phim theo danh mục
        const resMovies = await fetch(`/api/movies?category=${dbCategory}`); 
        if (!resMovies.ok) throw new Error("Lỗi tải danh sách phim");
        const dataMovies = await resMovies.json();
        setMoviesData(dataMovies);

        // Gọi API lấy phim hot
        const resTrending = await fetch('/api/movies?trending=true&limit=10');
        const dataTrending = await resTrending.json();
        setTrendingData(dataTrending);

      } catch (error) {
        console.error("Lỗi:", error);
        setMoviesData([]);
      } finally {
        setIsLoading(false); 
      }
    };
    fetchAllData();
  }, [slug]); 

  // 3. HÀM TỔNG HỢP: LỌC PHIM THEO TÌM KIẾM VÀ CÁC NÚT SELECT CHỌN LỌC
  const filteredMovies = Array.isArray(moviesData) ? moviesData.filter((movie) => {
    
    // Khớp từ khóa tìm kiếm
    const matchSearch = searchKeyword === "" || 
      movie.title?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      movie.subTitle?.toLowerCase().includes(searchKeyword.toLowerCase());

    // Khớp Thể Loại (Hỗ trợ tìm trong cả badge và genre)
    const matchGenre = selectedGenre === "Tất Cả" || 
      movie.badge?.includes(selectedGenre) || 
      movie.genre?.includes(selectedGenre);

    // Khớp Quốc Gia (Hỗ trợ DB lưu bằng chữ country hoặc quocGia)
    const matchCountry = selectedCountry === "Quốc gia" || 
      movie.country === selectedCountry || 
      movie.quocGia === selectedCountry;

    // Khớp Năm (Ép kiểu về String để so sánh chuẩn xác)
    const matchYear = selectedYear === "Năm" || String(movie.year) === selectedYear;

    // Trả về phim thỏa mãn TẤT CẢ tiêu chí
    return matchSearch && matchGenre && matchCountry && matchYear;
    
  }) : [];

  const categoryTitle = getCategoryName(slug);

  if (isLoading) {
    return (
      <div className={styles.pageContainer} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ color: "#e50914", fontSize: "18px", fontWeight: "bold" }}>
          Đang tải {categoryTitle}...
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.mainWrapper}>
        
        {/* BREADCRUMB */}
        <div className={styles.breadcrumb}>
          <Link href="/">Trang chủ</Link> <span className={styles.slash}>/</span>
          <span>Danh Sách</span> <span className={styles.slash}>/</span>
          <span className={styles.current}>{categoryTitle}</span>
        </div>

        <div className={styles.pageTitleWrapper}>
          <h1 className={styles.pageTitle}>{categoryTitle} mới cập nhật</h1>
          <p className={styles.pageDesc}>Tổng hợp danh sách {categoryTitle} chất lượng cao, cập nhật liên tục hàng ngày.</p>
        </div>

        <div className={styles.layoutFlex}>
          {/* CỘT TRÁI: BỘ LỌC VÀ DANH SÁCH PHIM */}
          <div className={styles.leftCol}>
            
            {/* BỘ LỌC */}
            <div className={styles.filters}>
              <select className={styles.filterSelect} value={selectedGenre} onChange={e => setSelectedGenre(e.target.value)}>
                {genres.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              <select className={styles.filterSelect} value={selectedCountry} onChange={e => setSelectedCountry(e.target.value)}>
                {countries.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select className={styles.filterSelect} value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            {/* DANH SÁCH PHIM HIỂN THỊ */}
            <div className={styles.moviesGrid}>
              {filteredMovies.length > 0 ? (
                filteredMovies.map(movie => <MovieCard key={movie._id} movie={movie} />)
              ) : (
                <div style={{ color: "#888", padding: "40px 0", textAlign: "center", width: "100%", gridColumn: "1 / -1", background: "#161616", borderRadius: "8px" }}>
                  Không tìm thấy bộ phim nào phù hợp với bộ lọc.
                </div>
              )}
            </div>
            
            {/* PHÂN TRANG */}
            <div className={styles.pagination}>
              <button className={styles.pageBtn} onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>‹</button>
              {pageNumbers.map(n => (
                <button key={n} className={`${styles.pageBtn} ${currentPage === n ? styles.pageBtnActive : ""}`} onClick={() => setCurrentPage(n)}>{n}</button>
              ))}
              <span className={styles.pageEllipsis}>...</span>
              <button className={styles.pageBtn} onClick={() => setCurrentPage(totalPages)}>{totalPages}</button>
              <button className={styles.pageBtn} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>›</button>
            </div>

          </div>

          {/* CỘT PHẢI: SIDEBAR PHIM HOT */}
          <div className={styles.rightCol}>
            <div className={styles.sidebarSticky}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                <span style={{ display: "block", width: "4px", height: "18px", background: "#e50914", borderRadius: "2px" }}></span>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}>Phim Hot</span>
              </div>
              {trendingData.map(item => <TrendingCard key={item._id} item={item} />)}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}