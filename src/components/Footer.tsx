import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="row g-4">
          <div className="col-12 col-md-5">
            <div className="brand mb-3" style={{ fontSize: '20px' }}>TDPhim<span>TV</span></div>
            <p className="footer-desc">
              TDPhim - Xem phim online miễn phí chất lượng cao...
            </p>
            <p className="footer-desc">Disclaimer: TDPhim không tự giữ nào nguồn phim nào...</p>
          </div>
          <div className="col-6 col-md-2">
            <div className="footer-heading">Trợ giúp</div>
            <ul className="footer-links">
              <li><Link href="/dieu-khoan">Điều khoản chung</Link></li>
              <li><Link href="/bao-mat">Chính sách riêng tư</Link></li>
              <li><Link href="/sitemap">Sitemap</Link></li>
              <li><Link href="/dmca">DMCA</Link></li>
            </ul>
          </div>
          <div className="col-6 col-md-2">
            <div className="footer-heading">TDPhim</div>
            <ul className="footer-links">
              <li><Link href="/">Trang chủ</Link></li>
              <li><Link href="/gioi-thieu">Giới thiệu</Link></li>
              <li><Link href="/lien-he">Liên hệ</Link></li>
            </ul>
          </div>
          <div className="col-12 col-md-3">
            <div className="footer-heading">Theo dõi chúng tôi</div>
            <div className="d-flex gap-2 flex-wrap">
              <a href="#" style={{ background: '#1877f2', color: '#fff', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}><i className="bi bi-facebook"></i></a>
              <a href="#" style={{ background: '#e1306c', color: '#fff', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}><i className="bi bi-instagram"></i></a>
              <a href="#" style={{ background: '#ff0000', color: '#fff', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}><i className="bi bi-youtube"></i></a>
              <a href="#" style={{ background: '#0088cc', color: '#fff', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}><i className="bi bi-telegram"></i></a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          © 2024 TDPhimTV. All rights reserved. | Design inspired by TDPhim.cx
        </div>
      </div>
    </footer>
  );
}