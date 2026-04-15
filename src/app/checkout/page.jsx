"use client";
import { Suspense } from "react";
import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// --- 1. PHẦN NỘI DUNG CHÍNH (Chứa useSearchParams) ---
function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const type = searchParams.get("type");
  const id = searchParams.get("id");
  const title = searchParams.get("title") || searchParams.get("packageId");
  const price = parseInt(searchParams.get("price")) || 0;

  const [selectedMethod, setSelectedMethod] = useState("momo");
  const [isProcessing, setIsProcessing] = useState(false);

  const userId = typeof window !== "undefined" ? localStorage.getItem('userId') : null;

  const paymentMethods = [
    {
      id: "momo",
      name: "Ví MoMo",
      icon: "bi bi-wallet2",
      iconColor: "#f97316",
      desc: "Thanh toán nhanh chóng qua ứng dụng MoMo",
      iconBg: "rgba(249, 115, 22, 0.15)"
    },
    {
      id: "vnpay",
      name: "VNPay QR",
      icon: "bi bi-qr-code",
      iconColor: "#0ea5e9",
      desc: "Thẻ ngân hàng và quét mã QR",
      iconBg: "rgba(14, 165, 233, 0.15)"
    },
    {
      id: "zalopay",
      name: "ZaloPay",
      icon: "bi bi-chat-square-text-fill",
      iconColor: "#0068ff",
      desc: "Thanh toán tiện lợi qua Zalo",
      iconBg: "rgba(0, 104, 255, 0.15)"
    },
    {
      id: "card",
      name: "Thẻ tín dụng / Debit",
      icon: "bi bi-credit-card-2-front",
      iconColor: "#8b5cf6",
      desc: "Visa, Mastercard, JCB",
      iconBg: "rgba(139, 92, 246, 0.15)"
    }
  ];

  const handlePayment = async () => {
    if (!userId) {
      alert("Vui lòng đăng nhập để thanh toán!");
      router.push('/login');
      return;
    }

    setIsProcessing(true);

    try {
      const endpoint = type === 'vip' ? '/api/goi-vip' : '/api/movies/buy';
      const body = type === 'vip'
        ? { userId, packageId: title, amount: price, paymentMethod: selectedMethod }
        : { userId, movieId: id, amount: price, paymentMethod: selectedMethod };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (res.ok) {
        setTimeout(() => {
          setIsProcessing(false);
          alert("✅ Thanh toán thành công!\nDịch vụ của bạn đã được kích hoạt.");
          router.push(type === 'vip' ? '/profile' : `/phim/${id}`);
        }, 5000);
      } else {
        setIsProcessing(false);
        alert(data.error || "Giao dịch bị từ chối. Vui lòng thử lại.");
      }
    } catch (err) {
      setIsProcessing(false);
      alert("Lỗi kết nối máy chủ. Vui lòng thử lại sau!");
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap');
        body { font-family: 'Be Vietnam Pro', sans-serif !important; background-color: #09090b !important; }
      `}</style>

      <div className="min-vh-100 text-white position-relative" style={{ backgroundColor: '#09090b' }}>
        <div className="position-absolute top-0 start-50 translate-middle-x" 
             style={{ width: '800px', height: '400px', background: 'radial-gradient(ellipse, rgba(220,38,38,0.15) 0%, transparent 70%)', zIndex: 0, pointerEvents: 'none' }}>
        </div>

        <div className="position-relative" style={{ zIndex: 1 }}>
          <nav className="navbar sticky-top border-bottom border-secondary border-opacity-25" style={{ background: 'rgba(9,9,11,0.85)', backdropFilter: 'blur(16px)' }}>
            <div className="container py-1">
              <div className="d-flex align-items-center gap-3">
                <button className="btn btn-dark rounded-circle border-secondary border-opacity-50 d-flex align-items-center justify-content-center p-0" 
                        style={{ width: '36px', height: '36px', background: 'rgba(255,255,255,0.05)' }} 
                        onClick={() => router.back()}
                        disabled={isProcessing}
                >
                  <i className="bi bi-arrow-left"></i>
                </button>
                <span className="fw-bold fs-5 text-white">TD<span className="text-danger">Phim</span> TV</span>
              </div>
              <div className="d-flex align-items-center gap-2 text-white-50 small">
                <div className="rounded-circle bg-success shadow" style={{ width: '8px', height: '8px' }}></div> Bảo mật SSL
              </div>
            </div>
          </nav>

          <div className="container py-5">
            <div className="row justify-content-center">
              <div className="col-xl-9">
                <div className="row g-4">
                  <div className="col-lg-7" style={{ pointerEvents: isProcessing ? 'none' : 'auto', opacity: isProcessing ? 0.6 : 1 }}>
                    <h1 className="fw-bold fs-2 text-white mb-2">Xác nhận thanh toán</h1>
                    <p className="text-white-50 small mb-5">Kiểm tra đơn hàng và chọn phương thức phù hợp</p>

                    <div className="text-white-50 small fw-bold text-uppercase mb-3" style={{ letterSpacing: '1.5px', fontSize: '11px' }}>Đơn hàng</div>
                    <div className="card bg-transparent border-secondary border-opacity-25 rounded-4 mb-4" style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                      <div className="card-body p-3 d-flex align-items-center gap-3">
                        <div className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0" 
                             style={{ width: '52px', height: '52px', background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.2)' }}>
                          <i className="bi bi-play-circle-fill text-danger fs-4"></i>
                        </div>
                        <div className="flex-grow-1">
                          <span className="badge text-danger rounded-pill mb-1 d-inline-block" 
                                style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.2)', fontSize: '10px', letterSpacing: '1px' }}>
                            {type === "vip" ? "GÓI VIP" : "MUA PHIM"}
                          </span>
                          <h6 className="fw-bold text-white mb-0 fs-5">{title}</h6>
                        </div>
                        <div className="fw-bold fs-4 text-danger lh-1">{price.toLocaleString("vi-VN")}<span className="fs-6 ms-1">₫</span></div>
                      </div>
                    </div>

                    <div className="text-white-50 small fw-bold text-uppercase mb-3" style={{ letterSpacing: '1.5px', fontSize: '11px' }}>Phương thức thanh toán</div>
                    <div className="d-flex flex-column gap-2">
                      {paymentMethods.map((m) => (
                        <div key={m.id} onClick={() => setSelectedMethod(m.id)}
                             className={`card rounded-4 border ${selectedMethod === m.id ? 'border-danger bg-danger bg-opacity-10' : 'border-secondary border-opacity-25'}`}
                             style={{ cursor: 'pointer', background: selectedMethod === m.id ? '' : 'rgba(255,255,255,0.03)', transition: '0.2s' }}>
                          <div className="card-body p-3 d-flex align-items-center gap-3">
                            <div className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0" 
                                 style={{ width: '45px', height: '45px', background: m.iconBg }}>
                              <i className={m.icon} style={{ color: m.iconColor, fontSize: '22px' }}></i>
                            </div>
                            <div className="flex-grow-1">
                              <h6 className="fw-bold text-white mb-0">{m.name}</h6>
                              <p className="text-white-50 small mb-0" style={{ fontSize: '12px' }}>{m.desc}</p>
                            </div>
                            <div className={`rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 ${selectedMethod === m.id ? 'bg-danger' : 'border border-secondary border-opacity-50'}`} 
                                 style={{ width: '22px', height: '22px' }}>
                              {selectedMethod === m.id && <i className="bi bi-check text-white small"></i>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="col-lg-5">
                    <div className="card border-secondary border-opacity-25 rounded-4 sticky-top" style={{ top: '85px', background: 'rgba(255,255,255,0.03)' }}>
                      <div className="card-header border-bottom border-secondary border-opacity-25 bg-transparent p-3">
                        <span className="text-white-50 small fw-bold text-uppercase" style={{ letterSpacing: '1px', fontSize: '11px' }}>Tóm tắt đơn hàng</span>
                      </div>
                      <div className="card-body p-4">
                        <div className="d-flex justify-content-between mb-2">
                          <span className="text-white-50 small">Tạm tính</span>
                          <span className="text-light">{price.toLocaleString("vi-VN")}₫</span>
                        </div>
                        <div className="d-flex justify-content-between mb-4 align-items-center">
                          <span className="text-white-50 small">Phí giao dịch</span>
                          <span className="badge text-success rounded-pill fw-bold" style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)' }}>Miễn phí</span>
                        </div>
                        <hr className="border-secondary border-opacity-50 mb-4" />
                        <div className="d-flex justify-content-between align-items-end mb-4">
                          <span className="text-white-50 fw-bold small">Tổng thanh toán</span>
                          <div className="text-danger fw-bold lh-1">
                            <span className="display-6 fw-bold">{price.toLocaleString("vi-VN")}</span>
                            <span className="fs-5 ms-1">₫</span>
                          </div>
                        </div>
                        <button className="btn btn-danger w-100 py-3 rounded-3 fw-bold d-flex justify-content-center align-items-center gap-2" 
                                onClick={handlePayment} disabled={isProcessing}>
                          {isProcessing ? (
                            <><span className="spinner-border spinner-border-sm"></span> ĐANG KẾT NỐI NGÂN HÀNG...</>
                          ) : (
                            <><i className="bi bi-shield-lock-fill fs-5"></i> THANH TOÁN NGAY</>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// --- 2. HÀM CHÍNH BỌC TRONG SUSPENSE ĐỂ FIX LỖI VERCEL ---
export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-vh-100 bg-dark text-white d-flex align-items-center justify-content-center">Đang tải trang thanh toán...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}