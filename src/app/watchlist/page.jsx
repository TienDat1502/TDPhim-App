"use client";
import React, { useEffect, useState } from 'react';
import MovieCard from '@/components/MovieCard';

export default function WatchlistPage() {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWatchlist = async () => {
    try {
      // 1. Chỉ lấy ID thật từ localStorage
      const userId = localStorage.getItem('userId');

      // 2. CHẶN TRƯỜNG HỢP CHƯA ĐĂNG NHẬP
      if (!userId) {
        setMovies([]); // Trả về mảng rỗng
        setIsLoading(false); // Tắt loading
        return; // Dừng hàm luôn, không chạy xuống dưới nữa
      }

      // 3. Nếu có userId thì mới tiến hành gọi API như bình thường
      const resUser = await fetch(`/api/user/${userId}`);
      if (!resUser.ok) return;

      const userData = await resUser.json();
      
      if (userData.watchlist && userData.watchlist.length > 0) {
        const moviePromises = userData.watchlist.map(id => 
          fetch(`/api/movies/${id}`).then(res => res.ok ? res.json() : null)
        );
        const moviesData = await Promise.all(moviePromises);
        setMovies(moviesData.filter(m => m !== null && !m.error));
      } else {
        setMovies([]);
      }
    } catch (error) {
      console.error("Lỗi tải danh sách:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlist();

    // ✅ NGHE TÍN HIỆU TỪ MOVIECARD
    window.addEventListener('watchlist-updated', fetchWatchlist);
    return () => window.removeEventListener('watchlist-updated', fetchWatchlist);
  }, []);

  return (
    <div className="bg-black min-vh-100 text-white py-5 px-4">
      <h2 className="fw-bold mb-4 border-bottom border-danger pb-2 d-inline-block">
         DANH SÁCH PHIM YÊU THÍCH
      </h2>
      
      {isLoading ? (
        <div className="text-center py-5">Đang tải...</div>
      ) : movies.length > 0 ? (
        <div className="row row-cols-2 row-cols-md-4 row-cols-lg-5 g-4">
          {movies.map(movie => (
            <div className="col" key={movie._id}>
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-5 bg-dark rounded-4 opacity-50">
           <i className="bi bi-heartbreak fs-1 d-block mb-3"></i>
           <p>Bạn chưa có phim nào trong danh sách yêu thích.</p>
        </div>
      )}
    </div>
  );
}