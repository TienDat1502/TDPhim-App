"use client";
import React, { useEffect, useState } from 'react';
import MovieCard from '@/components/MovieCard';
import Link from 'next/link';

export default function HistoryPage() {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      const userId = localStorage.getItem('userId') || "69c0ca1ac171a0e6689fc638";
      try {
        const res = await fetch(`/api/user/${userId}`);
        const data = await res.json();
        
        if (data.viewHistory) {
          // Lọc bỏ các phim bị null và lấy dữ liệu phim từ populate
          const historyData = data.viewHistory
            .map(item => item.movieId)
            .filter(movie => movie !== null);
          setMovies(historyData);
        }
      } catch (err) {
        console.error("Lỗi tải lịch sử:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="bg-black min-vh-100 text-white py-5 px-4">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4 border-bottom border-secondary pb-3">
          <h2 className="fw-bold m-0 text-uppercase">
            <i className="bi bi-clock-history me-2 text-danger"></i> Lịch sử xem phim
          </h2>
          <Link href="/profile" className="btn btn-outline-light btn-sm rounded-pill px-3">
            Quay lại Profile
          </Link>
        </div>

        {isLoading ? (
          <div className="text-center py-5">Đang tải lịch sử...</div>
        ) : movies.length > 0 ? (
          <div className="row row-cols-2 row-cols-md-4 row-cols-lg-5 g-4">
            {movies.map((movie) => (
              <div className="col" key={movie._id}>
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-5">
            <p className="text-secondary">Bạn chưa xem bộ phim nào gần đây.</p>
            <Link href="/" className="btn btn-danger mt-2">Khám phá phim ngay</Link>
          </div>
        )}
      </div>
    </div>
  );
}