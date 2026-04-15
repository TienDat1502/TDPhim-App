/* eslint-disable react-hooks/immutability */
// app/upgrade-vip/page.jsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const vipPackages = [
  { 
    id: 'Gói 1 Tháng', 
    price: 49000, 
    months: 1, 
    desc: 'Trải nghiệm toàn bộ nội dung VIP trong 30 ngày', 
    color: '#3b82f6' 
  },
  { 
    id: 'Gói 6 Tháng', 
    price: 249000, 
    months: 6, 
    desc: 'Tiết kiệm 15% - Xem không giới hạn', 
    color: '#eab308' 
  },
  { 
    id: 'Gói 1 Năm', 
    price: 399000, 
    months: 12, 
    desc: 'Tiết kiệm đến 30% - Lựa chọn tốt nhất', 
    color: '#ef4444', 
    isPopular: true 
  },
];

export default function UpgradeVipPage() {
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    const id = localStorage.getItem('userId');
    if (!id) {
      alert("Bạn cần đăng nhập để mua gói VIP!");
      router.push('/login');
      return;
    }
    setUserId(id);
    checkPending(id);
  }, [router]);

  const checkPending = async (id) => {
    try {
      const res = await fetch('/api/transactions');
      if (res.ok) {
        const txs = await res.json();
        const hasPending = txs.some(tx => 
          (tx.userId?._id === id || tx.userId === id) && 
          !tx.movieId && 
          tx.status === "Đang chờ"
        );
        setIsPending(hasPending);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBuyPackage = (pkg) => {
    if (isPending) return;
    router.push(`/checkout?type=vip&packageId=${encodeURIComponent(pkg.id)}&price=${pkg.price}`);
  };

  return (
    <div className="bg-black min-vh-100 text-white py-5">
      <div className="container">
        <div className="text-center mb-5">
          <h1 className="display-5 fw-bold text-yellow-400 mb-2">
            <i className="bi bi-gem me-3"></i>NÂNG CẤP VIP
          </h1>
          <p className="text-zinc-400">Mở khóa toàn bộ phim VIP không giới hạn</p>
        </div>

        {isPending && (
          <div className="alert alert-warning mx-auto mb-5 text-center" style={{ maxWidth: '600px' }}>
            Bạn đang có đơn hàng VIP chờ duyệt. Vui lòng chờ Admin xác nhận trước khi mua thêm.
          </div>
        )}

        <div className="row g-4 justify-content-center">
          {vipPackages.map((pkg) => (
            <div key={pkg.id} className="col-lg-3 col-md-6">
              <div 
                className={`card h-100 bg-zinc-900 border-0 shadow-lg overflow-hidden ${pkg.isPopular ? 'border border-danger border-3' : ''}`}
              >
                {pkg.isPopular && (
                  <div className="bg-danger text-white text-center py-1 fw-bold">PHỔ BIẾN NHẤT</div>
                )}

                <div className="p-4 text-center d-flex flex-column h-100">
                  <h5 className="fw-bold mb-4" style={{ color: pkg.color }}>{pkg.id}</h5>
                  
                  <div className="mb-4">
                    <span className="display-5 fw-bold">{pkg.price.toLocaleString()}</span>
                    <span className="fs-6 text-zinc-400"> ₫</span>
                  </div>

                  <p className="text-zinc-400 mb-4 flex-grow-1" style={{ fontSize: '14px' }}>{pkg.desc}</p>

                  <button
                    onClick={() => handleBuyPackage(pkg)}
                    disabled={isPending}
                    className="btn w-100 py-3 fw-bold rounded-3 text-white mt-auto"
                    style={{ 
                      backgroundColor: pkg.color,
                      opacity: isPending ? 0.6 : 1 
                    }}
                  >
                    {isPending ? 'ĐANG CHỜ DUYỆT' : 'CHỌN GÓI NÀY'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}