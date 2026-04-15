"use client";

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import MovieCard from '@/components/MovieCard';
import TrendingCard from '@/components/TrendingCard';

// --- 1. PHẦN NỘI DUNG CHÍNH (Chứa useSearchParams) ---
function HomeContent() {
  const [phimLe, setPhimLe] = useState([]);
  const [phimBo, setPhimBo] = useState([]);
  const [phimChieuRap, setPhimChieuRap] = useState([]);
  const [trendingData, setTrendingData] = useState([]);
  const [topRatedData, setTopRatedData] = useState([]);
  const [allMoviesForSearch, setAllMoviesForSearch] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);

  const searchParams = useSearchParams();
  const searchKeyword = searchParams.get("search") || "";

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoading(true);
        const [resLe, resBo, resRap, resTrending, resTopRated] = await Promise.all([
          fetch('/api/movies?category=phim-le&limit=8'),
          fetch('/api/movies?category=phim-bo&limit=8'),
          fetch('/api/movies?category=chieu-rap&limit=8'),
          fetch('/api/movies?trending=true&limit=5'),
          fetch('/api/movies?topRated=true&limit=5')
        ]);

        const dataLe = await resLe.json();
        const dataBo = await resBo.json();
        const dataRap = await resRap.json();
        const dataTrending = await resTrending.json();
        const dataTopRated = await resTopRated.json();

        setPhimLe(dataLe);
        setPhimBo(dataBo);
        setPhimChieuRap(dataRap);
        setTrendingData(dataTrending);
        setTopRatedData(dataTopRated);
        setAllMoviesForSearch([...dataLe, ...dataBo, ...dataRap]);

      } catch (error) {
        console.error("Lỗi lấy dữ liệu:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllData();
  }, []);

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
              <>
                <div className="section-wrap" style={{ borderTop: 'none', paddingTop: '0' }}>
                  <div className="section-title">MOTCHILL ĐỀ CỬ</div>
                  <div className="movies-grid">
                    {phimBo.slice(0, 4).map(movie => <MovieCard key={movie._id} movie={movie} />)}
                  </div>
                </div>
                <div className="section-wrap">
                  <div className="section-title">
                    PHIM BỘ MỚI
                    <Link href="/the-loai/phim-bo">Xem tất cả <i className="bi bi-chevron-right"></i></Link>
                  </div>
                  <div className="movies-grid">
                    {phimBo.slice(4, 8).map(movie => <MovieCard key={movie._id} movie={movie} />)}
                  </div>
                </div>
                <div className="section-wrap">
                  <div className="section-title">
                    PHIM LẺ MỚI
                    <Link href="/the-loai/phim-le">Xem tất cả <i className="bi bi-chevron-right"></i></Link>
                  </div>
                  <div className="movies-grid">
                    {phimLe.slice(0, 8).map(movie => <MovieCard key={movie._id} movie={movie} />)}
                  </div>
                </div>
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

// --- 2. HÀM CHÍNH BỌC TRONG SUSPENSE ĐỂ FIX LỖI VERCEL ---
export default function Home() {
  return (
    <Suspense fallback={<div className="container py-4 text-center text-danger fw-bold">Đang khởi tạo ứng dụng...</div>}>
      <HomeContent />
    </Suspense>
  );
}