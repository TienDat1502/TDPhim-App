"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import MovieCard from '@/components/MovieCard';
import TrendingCard from '@/components/TrendingCard';

export default function Home() {
  const [phimLe, setPhimLe] = useState([]);
  const [phimBo, setPhimBo] = useState([]);
  const [phimChieuRap, setPhimChieuRap] = useState([]);
  const [trendingData, setTrendingData] = useState([]);
  const [topRatedData, setTopRatedData] = useState([]); // State cho phim đánh giá cao
  const [allMoviesForSearch, setAllMoviesForSearch] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);

  const searchParams = useSearchParams();
  const searchKeyword = searchParams.get("search") || "";

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoading(true);
        
        // ĐÃ SỬA: Thêm biến resTopRated vào mảng kết quả
        const [resLe, resBo, resRap, resTrending, resTopRated] = await Promise.all([
          fetch('/api/movies?category=phim-le&limit=8'),
          fetch('/api/movies?category=phim-bo&limit=8'),
          fetch('/api/movies?category=chieu-rap&limit=8'),
          fetch('/api/movies?trending=true&limit=5'),
          fetch('/api/movies?topRated=true&limit=5') // API lấy phim đánh giá cao
        ]);

        const dataLe = await resLe.json();
        const dataBo = await resBo.json();
        const dataRap = await resRap.json();
        const dataTrending = await resTrending.json();
        const dataTopRated = await resTopRated.json(); // Đã có thể gọi thoải mái

        setPhimLe(dataLe);
        setPhimBo(dataBo);
        setPhimChieuRap(dataRap);
        setTrendingData(dataTrending);
        setTopRatedData(dataTopRated); // Lưu dữ liệu vào state

        // GỘP DỮ LIỆU ĐỂ TÌM KIẾM CÓ KẾT QUẢ
        setAllMoviesForSearch([...dataLe, ...dataBo, ...dataRap]);

      } catch (error) {
        console.error("Lỗi lấy dữ liệu:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllData();
  }, []);

  // Logic lọc tìm kiếm
  const filteredMovies = allMoviesForSearch.filter((movie) => {
    return (
      movie.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      movie.subTitle.toLowerCase().includes(searchKeyword.toLowerCase())
    );
  });

  if (isLoading) {
    return (
      <div className="container py-4" style={{ textAlign: "center", color: "#e50914", fontWeight: "bold", minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        Đang tải dữ liệu đa vũ trụ phim...
      </div>
    );
  }

  return (
    <main>
      <div className="container py-4">
        <div className="row g-4">
          
          <div className="col-12 col-lg-9">
            
            {searchKeyword ? (
              // KẾT QUẢ TÌM KIẾM
              <div className="section-wrap" style={{ borderTop: 'none', paddingTop: '0' }}>
                <div className="section-title" style={{ color: '#e50914' }}>
                  KẾT QUẢ TÌM KIẾM CHO: &quot;{searchKeyword}&quot;
                </div>
                {filteredMovies.length > 0 ? (
                  <div className="movies-grid">
                    {filteredMovies.map(movie => <MovieCard key={movie._id} movie={movie} />)}
                  </div>
                ) : (
                  <div style={{ padding: "40px", textAlign: "center", color: "#888", background: "#161616", borderRadius: "10px" }}>
                    Rất tiếc, không tìm thấy phim nào chứa từ khóa &quot;{searchKeyword}&quot;.
                  </div>
                )}
              </div>
            ) : (
              // TRANG CHỦ MẶC ĐỊNH
              <>
                {/* ĐỀ CỬ: Lấy 4 phim đầu tiên của Phim Bộ làm đề cử */}
                <div className="section-wrap" style={{ borderTop: 'none', paddingTop: '0' }}>
                  <div className="section-title">
                    MOTCHILL ĐỀ CỬ
                  </div>
                  <div className="movies-grid">
                    {phimBo.slice(0, 4).map(movie => <MovieCard key={movie._id} movie={movie} />)}
                  </div>
                </div>

                {/* PHIM BỘ MỚI: Lấy 4 phim tiếp theo của Phim Bộ */}
                <div className="section-wrap">
                  <div className="section-title">
                    PHIM BỘ MỚI
                    <Link href="/the-loai/phim-bo">Xem tất cả <i className="bi bi-chevron-right"></i></Link>
                  </div>
                  <div className="movies-grid">
                    {phimBo.slice(4, 8).map(movie => <MovieCard key={movie._id} movie={movie} />)}
                  </div>
                </div>

                {/* PHIM LẺ MỚI: Lấy 8 phim từ API Phim Lẻ */}
                <div className="section-wrap">
                  <div className="section-title">
                    PHIM LẺ MỚI
                    <Link href="/the-loai/phim-le">Xem tất cả <i className="bi bi-chevron-right"></i></Link>
                  </div>
                  <div className="movies-grid">
                    {phimLe.slice(0, 8).map(movie => <MovieCard key={movie._id} movie={movie} />)}
                  </div>
                </div>

                {/* PHIM CHIẾU RẠP / HOẠT HÌNH: Lấy từ API Phim Chiếu Rạp */}
                <div className="section-wrap">
                  <div className="section-title">
                    PHIM CHIẾU RẠP & HOẠT HÌNH
                    <Link href="/the-loai/phim-chieu-rap">Xem tất cả <i className="bi bi-chevron-right"></i></Link>
                  </div>
                  <div className="movies-grid">
                    {phimChieuRap.slice(0, 8).map(movie => <MovieCard key={movie._id} movie={movie} />)}
                  </div>
                </div>
              </>
            )}

          </div>

          {/* CỘT SIDEBAR */}
          <div className="col-12 col-lg-3">
            <div className="sidebar-box">
              <div className="section-title" style={{ marginBottom: '12px' }}>PHIM HOT TRONG TUẦN</div>
              {trendingData.map(item => <TrendingCard key={item._id} item={item} />)}
            </div>

            <div className="sidebar-box">
              <div className="section-title" style={{ marginBottom: '12px' }}>ĐÁNH GIÁ CAO</div>
              {topRatedData.map(item => <TrendingCard key={`rating-${item._id}`} item={item} />)}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}