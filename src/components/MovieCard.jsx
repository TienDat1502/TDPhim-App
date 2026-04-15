"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "@/app/phimLe.module.css";

const slugify = (text) => {
  if (!text) return "";
  return text.toString().toLowerCase()
    .replace(/á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, 'a')
    .replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, 'e')
    .replace(/i|í|ì|ỉ|ĩ|ị/gi, 'i')
    .replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, 'o')
    .replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, 'u')
    .replace(/ý|ỳ|ỷ|ỹ|ỵ/gi, 'y')
    .replace(/đ/gi, 'd')
    .replace(/\s+/g, '-') 
    .replace(/[^a-z0-9-]/g, '') 
    .replace(/\-\-+/g, '-') 
    .replace(/^-+/, '').replace(/-+$/, ''); 
};

export default function MovieCard({ movie }) {
  const [isLiked, setIsLiked] = useState(false);
  const movieSlug = `${movie._id}-${slugify(movie.title)}`;

  useEffect(() => {
    const checkLikeStatus = async () => {
      const userId = localStorage.getItem('userId') || "69c0ca1ac171a0e6689fc638";
      if (!userId) return;
      try {
        const res = await fetch(`/api/user/${userId}`);
        if (res.ok) {
          const userData = await res.json();
          const liked = userData.watchlist?.some(id => id.toString() === movie._id.toString());
          setIsLiked(!!liked);
        }
      } catch (err) { console.error("Lỗi:", err); }
    };
    checkLikeStatus();
  }, [movie._id]);

  const handleToggleWatchlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const userId = localStorage.getItem('userId') || "69c0ca1ac171a0e6689fc638";
    try {
      const res = await fetch('/api/user/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, movieId: movie._id })
      });
      const data = await res.json();
      if (data.success) {
        setIsLiked(data.isAdded);
        window.dispatchEvent(new Event("watchlist-updated"));
      }
    } catch (err) { console.error("Lỗi:", err); }
  };

  return (
    <Link href={`/phim/${movieSlug}`} className={styles.movieCard}>
      <div className={styles.cardImgWrap}>
        
        <div 
          className={styles.cardPlaceholder} 
          style={{ 
            background: movie.bgGradient || '#222',
            backgroundImage: movie.poster ? `url(${movie.poster})` : 'none',
            backgroundSize: 'cover', backgroundPosition: 'center'
          }}
        ></div>
        
        <div className={styles.cardOverlay}><div className={styles.playBtn}>▶</div></div>
        
        {/* GIỮ NGUYÊN NÚT TRÁI TIM THEO Ý BẠN */}
        <button 
          onClick={handleToggleWatchlist}
          className="position-absolute d-flex align-items-center justify-content-center border-0 shadow-sm"
          style={{ 
            zIndex: 99, top: '25px', right: '1px', width: '32px', height: '32px',
            borderRadius: '50%', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
            color: isLiked ? '#ff4757' : '#fff', transition: 'all 0.3s ease', cursor: 'pointer', outline: 'none'
          }}
        >
          <i className={`bi ${isLiked ? 'bi-heart-fill' : 'bi-heart'}`} style={{ fontSize: '16px' }}></i>
        </button>

        {/* NHÃN VIP (Góc trên trái) */}
        {movie.isVip && (
          <div 
            className="position-absolute d-flex align-items-center justify-content-center"
            style={{ 
              zIndex: 20, top: '5px', left: '5px',
              background: 'linear-gradient(90deg, #ffc107 0%, #ff9800 100%)', 
              color: '#000', padding: '2px 6px', borderRadius: '3px',
              fontSize: '8px', fontWeight: 'bold'
            }}
          >
            VIP
          </div>
        )}

        {/* ĐƯA CÁC CHỮ LÊN SÁT TRÊN CAO (Sửa từ 40px thành 5px) */}
        <span className={styles.badgeLeft} style={{ top: '5px', left: movie.isVip ? '35px' : '5px' }}>{movie.badge}</span>
        <span className={styles.badgeRight} style={{ top: '5px' }}>{movie.quality}</span>
        
        {/* PHẦN DƯỚI GIỮ NGUYÊN */}
        {movie.year && (
          <span className={`${styles.badgeBottom} ${styles.badgeBottomLeft}`}>{movie.year}</span>
        )}
        <span className={`${styles.badgeBottom} ${styles.badgeBottomRight}`}>N/A</span>
      </div>

      <div className={styles.cardInfo}>
        <div className={styles.cardTitle}>{movie.title}</div>
        <div className={styles.cardSub}>{movie.subTitle}</div>
      </div>
    </Link>
  );
}