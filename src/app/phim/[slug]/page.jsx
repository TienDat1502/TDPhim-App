"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import MovieCard from '@/components/MovieCard';
import ReviewSection from "@/components/ReviewSection";

export default function MovieDetailPage({ params }) {
  const { slug } = React.use(params);
  const router = useRouter();

  const [movie, setMovie] = useState(null);
  const [relatedMovies, setRelatedMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isWatching, setIsWatching] = useState(false);

  const [userId, setUserId] = useState(null);
  const [userVipStatus, setUserVipStatus] = useState(false);
  const [vipExpiresAt, setVipExpiresAt] = useState(null); // 👉 Thêm State lưu thời gian hết hạn VIP
  
  // Trạng thái mua phim lẻ & chờ duyệt
  const [hasPurchased, setHasPurchased] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const movieId = slug.split('-')[0];

  // ==========================================
  // 1. LẤY THÔNG TIN USER (Kèm VIP & Giờ hết hạn)
  // ==========================================
  useEffect(() => {
    const savedUserId = localStorage.getItem('userId');
    if (!savedUserId) return;
    
    setUserId(savedUserId);

    fetch(`/api/user/${savedUserId}`, { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        setUserVipStatus(data.isVip || false);
        setVipExpiresAt(data.vipExpiresAt || null); // Lưu mốc hết hạn

        if (data.purchasedMovies?.includes(movieId)) {
          setHasPurchased(true);
        } else {
          fetch('/api/transactions')
            .then(res => res.json())
            .then(txs => {
              const pending = txs.find(tx =>
                (tx.userId?._id === savedUserId || tx.userId === savedUserId) &&
                tx.movieId === movieId &&
                tx.status === "Đang chờ"
              );
              if (pending) setIsPending(true);
            });
        }
      })
      .catch(err => console.error(err));
  }, [movieId]);

  // ==========================================
  // 2. MÁY DÒ DUYỆT ĐƠN PHIM LẺ (Quét 5s / lần)
  // ==========================================
  useEffect(() => {
    let interval;
    if (isPending && userId) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/user/${userId}`, { cache: 'no-store' });
          if (res.ok) {
            const data = await res.json();
            if (data.purchasedMovies && data.purchasedMovies.includes(movieId)) {
              setIsPending(false); 
              setHasPurchased(true); 
              alert("🎉 Giao dịch thành công! Phim đã được mở khóa. Chúc bạn xem phim vui vẻ!");
              clearInterval(interval); 
            }
          }
        } catch (error) {
          console.error("Lỗi khi dò trạng thái:", error);
        }
      }, 5000); 
    }
    return () => clearInterval(interval);
  }, [isPending, userId, movieId]);

  // ==========================================
  // 3. 💣 BOM HẸN GIỜ: ĐÁ VĂNG KHI HẾT VIP
  // ==========================================
  useEffect(() => {
    if (!isWatching || !movie?.isVip || !userVipStatus || !vipExpiresAt) return;

    // Tính toán thời gian còn lại ra mili-giây
    const timeLeft = new Date(vipExpiresAt).getTime() - new Date().getTime();

    // Hàm xử lý lúc cháy nổ (hết hạn)
    const handleExpire = () => {
      setIsWatching(false); 
      setUserVipStatus(false); 
      alert("⏱ THÔNG BÁO: Gói VIP của bạn đã hết hạn! Vui lòng nâng cấp để tiếp tục xem phim.");
      
      // Bắn request ngầm để Server tự động tước VIP trong DB
      fetch(`/api/user/${userId}`, { cache: 'no-store' }).catch(err => console.error(err));
    };

    if (timeLeft <= 0) {
      handleExpire();
      return;
    }

    // Đặt đồng hồ đếm ngược
    const timer = setTimeout(() => {
      handleExpire();
    }, timeLeft);

    return () => clearTimeout(timer); // Dọn dẹp nếu chuyển trang sớm
  }, [isWatching, movie, userVipStatus, vipExpiresAt, userId]);

  // ==========================================
  // 4. LẤY THÔNG TIN PHIM
  // ==========================================
  useEffect(() => {
    if (!movieId) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/movies/${movieId}`);
        if (res.ok) {
          const data = await res.json();
          setMovie(data);

          if (data.category) {
            const resRelated = await fetch(`/api/movies?category=${data.category}&limit=4`);
            if (resRelated.ok) {
              const all = await resRelated.json();
              setRelatedMovies(all.filter(m => m._id !== movieId));
            }
          }
        }
      } catch (error) {
        console.error("Lỗi tải phim:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [movieId]);

  // ==========================================
  // HÀM XỬ LÝ NÚT BẤM
  // ==========================================
  const handleBuyMovie = () => {
    if (!userId) {
      alert("Vui lòng đăng nhập để mua phim!");
      router.push('/login');
      return;
    }
    router.push(`/checkout?type=movie&id=${movie._id}&title=${encodeURIComponent(movie.title)}&price=${movie.price}`);
  };

  const handleStartWatching = () => {
    if (movie.price > 0 && !hasPurchased) return;
    if (movie.isVip && !userVipStatus) return;

    setIsWatching(true); // Bật Video

    // 👉 TỰ ĐỘNG TĂNG VIEW (Chạy ngầm)
    if (movie?._id) {
      fetch(`/api/movies/${movie._id}/view`, { method: 'POST' })
        .catch(err => console.error("Không tăng được view:", err));
    }

    // 👉 LƯU LỊCH SỬ XEM PHIM (Chạy ngầm)
    if (userId && movie?._id) {
      fetch('/api/user/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, movieId: movie._id })
      }).catch(err => console.error(err));
    }
  };

  // MÀN HÌNH LOADING & LỖI
  if (isLoading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#09090b' }}>
        <div className="spinner-grow text-danger" role="status" style={{ width: '3rem', height: '3rem' }}></div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center text-white" style={{ backgroundColor: '#09090b' }}>
        <i className="bi bi-film display-1 text-secondary mb-3 opacity-25"></i>
        <h3 className="fw-bold mb-4">KHÔNG TÌM THẤY PHIM NÀY</h3>
        <Link href="/" className="btn btn-danger px-4 py-2 rounded-pill fw-bold">Quay lại trang chủ</Link>
      </div>
    );
  }

  // ==========================================
  // GIAO DIỆN CHÍNH
  // ==========================================
  return (
    <>
      <style>{`
        body { font-family: 'Be Vietnam Pro', sans-serif !important; background-color: #09090b !important; }
        .glass-panel { background: rgba(15, 15, 18, 0.85); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.05); }
        .hover-scale { transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer; }
        .hover-scale:hover { transform: scale(1.03); }
        .play-btn-glow { box-shadow: 0 0 30px rgba(220, 38, 38, 0.6); }
      `}</style>

      <div className="min-vh-100 text-white pb-5 position-relative" style={{ backgroundColor: '#09090b' }}>
        
        <div className="position-absolute top-0 start-50 translate-middle-x" 
             style={{ width: '100%', height: '600px', background: 'radial-gradient(circle at top, rgba(220,38,38,0.15) 0%, transparent 70%)', zIndex: 0, pointerEvents: 'none' }}>
        </div>

        <div className="container pt-4 pt-lg-5 position-relative" style={{ zIndex: 1 }}>
          <div className="row justify-content-center">
            <div className="col-lg-10">
              
              <div className="ratio ratio-21x9 bg-black rounded-4 overflow-hidden mb-4 shadow-lg position-relative border border-secondary border-opacity-25">

                {/* 1. PHIM BÁN LẺ & CHƯA MUA */}
                {movie.price > 0 && !hasPurchased ? (
                  <div className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center text-center p-4" 
                       style={{ background: 'radial-gradient(circle, #1a0505 0%, #000 100%)' }}>
                    
                    {isPending ? (
                      <div className="glass-panel p-5 rounded-4 d-flex flex-column align-items-center">
                         <div className="spinner-border text-danger mb-4" style={{ width: '3rem', height: '3rem' }}></div>
                         <h4 className="fw-bold text-white mb-2">ĐANG CHỜ XÁC NHẬN</h4>
                         <p className="text-white-50 small mb-0">Hệ thống đang kiểm tra thanh toán. Sẽ tự động làm mới sau 5s...</p>
                      </div>
                    ) : (
                      <div className="glass-panel p-5 rounded-4">
                        <i className="bi bi-cart-x display-4 text-danger mb-3 d-block"></i>
                        <h4 className="fw-bold mb-2">PHIM CHIẾU RẠP ĐẶC QUYỀN</h4>
                        <p className="text-white-50 small mb-4 px-3" style={{ maxWidth: '400px' }}>
                          Đây là bộ phim thu phí. Vui lòng thanh toán để mở khóa trọn bộ phim với chất lượng 4K.
                        </p>
                        <button onClick={handleBuyMovie} className="btn btn-danger btn-lg px-5 py-3 rounded-pill fw-bold shadow-lg hover-scale">
                          MUA NGAY - {movie.price.toLocaleString('vi-VN')} VNĐ
                        </button>
                      </div>
                    )}
                  </div>
                ) : 
                
                /* 2. PHIM VIP & CHƯA CÓ GÓI VIP */
                movie.isVip && !userVipStatus ? (
                  <div className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center text-center p-4"
                       style={{ background: 'radial-gradient(circle, #1a1500 0%, #000 100%)' }}>
                    <div className="glass-panel p-5 rounded-4">
                      <i className="bi bi-shield-lock-fill display-4 text-warning mb-3 d-block"></i>
                      <h4 className="fw-bold text-white mb-2">NỘI DUNG DÀNH CHO VIP</h4>
                      <p className="text-white-50 small mb-4 px-3" style={{ maxWidth: '400px' }}>
                        Tài khoản của bạn chưa đăng ký gói VIP hoặc đã hết hạn. Vui lòng nâng cấp để xem.
                      </p>
                      <Link href="/upgrade-vip" className="btn btn-warning btn-lg px-5 py-3 rounded-pill fw-bold text-dark shadow-lg hover-scale">
                        <i className="bi bi-gem me-2"></i>NÂNG CẤP VIP NGAY
                      </Link>
                    </div>
                  </div>
                ) : 
                
                /* 3. ĐANG PHÁT VIDEO */
                isWatching && movie.videoUrl ? (
                  movie.videoUrl.includes('youtube') || movie.videoUrl.includes('youtu.be') ? (
                    <iframe src={`${movie.videoUrl}?autoplay=1&rel=0`} title={movie.title} allowFullScreen className="w-100 h-100 border-0"></iframe>
                  ) : (
                    <video controls autoPlay className="w-100 h-100">
                      <source src={movie.videoUrl} type="video/mp4" />
                    </video>
                  )
                ) : 
                
                /* 4. MÀN HÌNH CHỜ (POSTER) CHƯA BẤM PLAY */
                (
                  <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                       style={{ backgroundImage: movie.poster ? `url(${movie.poster})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                    
                    <div className="position-absolute w-100 h-100 bg-black opacity-50"></div>
                    
                    <div className="position-absolute top-0 start-0 m-4 z-2">
                      {movie.price > 0 && <span className="badge bg-danger fs-6 px-3 py-2 rounded-pill shadow me-2"><i className="bi bi-cash-coin me-1"></i> ĐÃ MUA</span>}
                      {movie.isVip && <span className="badge bg-warning text-dark fs-6 px-3 py-2 rounded-pill shadow"><i className="bi bi-crown-fill me-1"></i> VIP</span>}
                    </div>

                    <div className="position-relative z-3 text-center hover-scale" onClick={handleStartWatching}>
                      <div className="bg-danger rounded-circle d-flex align-items-center justify-content-center play-btn-glow mb-3 mx-auto" 
                           style={{ width: '80px', height: '80px' }}>
                        <i className="bi bi-play-fill text-white" style={{ fontSize: '3rem', marginLeft: '6px' }}></i>
                      </div>
                      <div className="fw-bold tracking-widest text-white shadow-sm" style={{ letterSpacing: '2px' }}>NHẤN ĐỂ XEM</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* THÔNG TIN CHI TIẾT PHIM */}
        <div className="container mb-5">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end border-bottom border-secondary border-opacity-25 pb-4 mb-4">
                <div className="mt-2">
                  <div className="d-flex align-items-center gap-2 mb-2">
                     <span className="badge bg-secondary bg-opacity-25 text-light border border-secondary border-opacity-50">{movie.year}</span>
                     <span className="badge bg-secondary bg-opacity-25 text-light border border-secondary border-opacity-50">{movie.badge}</span>
                  </div>
                  <h1 className="fw-bold display-4 mb-0 text-white">{movie.title}</h1>
                  <p className="text-white-50 fs-5 mt-1 mb-0">{movie.subTitle}</p>
                </div>

                <div className="mt-4 mt-md-0">
                  {!userVipStatus ? (
                    <Link href="/upgrade-vip" className="btn btn-outline-warning fw-bold px-4 py-2 rounded-pill shadow-sm hover-scale">
                      <i className="bi bi-gem me-2"></i>Nâng cấp VIP
                    </Link>
                  ) : (
                    <div className="bg-warning bg-opacity-10 text-warning border border-warning border-opacity-50 px-4 py-2 rounded-pill fw-bold shadow-sm d-inline-block">
                      <i className="bi bi-crown-fill me-2"></i>ĐẶC QUYỀN VIP
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-5">
                <h6 className="text-danger fw-bold text-uppercase mb-3" style={{ letterSpacing: '1.5px' }}>Nội dung phim</h6>
                <p className="text-white-50 fs-6" style={{ lineHeight: '1.9', textAlign: 'justify' }}>
                  {movie.description || "Nội dung phim đang được cập nhật..."}
                </p>
              </div>

              <ReviewSection movieId={movie._id} />
            </div>
          </div>
        </div>

        {/* PHIM CÙNG THỂ LOẠI */}
        {relatedMovies.length > 0 && (
          <div className="container py-4">
            <div className="row justify-content-center">
               <div className="col-lg-10">
                  <h5 className="text-white fw-bold mb-4 d-flex align-items-center gap-2">
                    CÓ THỂ BẠN SẼ THÍCH
                    <div className="bg-danger rounded-pill flex-grow-1 ms-2" style={{ height: '2px', opacity: 0.2 }}></div>
                  </h5>
                  <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-4">
                    {relatedMovies.map(item => (
                      <div className="col" key={item._id}>
                        <MovieCard movie={item} />
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}