"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "../dndk.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  
  // State lưu dữ liệu form
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Đặt lại lỗi và bật trạng thái loading
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Sửa lỗi ở đây: Đổi formData thành loginForm
        body: JSON.stringify(loginForm), 
      });

      const data = await res.json();

      if (res.ok) {
        alert("Đăng nhập thành công!");

        // 🔥 TÁCH BIỆT "VÍ" CHO 2 THẾ GIỚI 🔥
        if (data.user.role === "admin") {
          // 1. Nếu là Admin -> Lưu vào ví riêng của Admin
          localStorage.setItem("adminId", data.user.id);
          localStorage.setItem("adminRole", data.user.role); 
          window.location.href = "/admin"; // Bay vào trang quản trị
        } else {
          // 2. Nếu là User thường -> Lưu vào ví của User
          localStorage.setItem("userId", data.user.id);
          localStorage.setItem("userRole", data.user.role); 
          window.location.href = "/"; // Về trang chủ xem phim
        }
      } else {
        // Nếu bị Khóa (Ban) hoặc sai pass, hiển thị cảnh báo
        setError(data.error); 
      }
    } catch (err) {
      setError("Lỗi kết nối máy chủ. Vui lòng thử lại sau!");
    } finally {
      // Tắt trạng thái loading
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.glowBlob} />
      <div className={styles.contentWrapper}>
        <div className={styles.logoWrap}>
          <Link href="/" className={styles.logoText}>Motchill<span>TV</span></Link>
          <p className={styles.logoDesc}>Xem phim HD Vietsub miễn phí</p>
        </div>

        <div className={styles.cardGlow}>
          <div className={styles.tabs}>
            <Link href="/login" className={`${styles.tabBtn} ${styles.tabActive}`}>Đăng Nhập</Link>
            <Link href="/register" className={`${styles.tabBtn} ${styles.tabInactive}`}>Đăng Ký</Link>
          </div>
          
          <form className={styles.formPadding} onSubmit={handleLogin}>
            
            {/* Hiển thị lỗi nếu có */}
            {error && (
              <div style={{ color: "#e50914", fontSize: "14px", marginBottom: "15px", textAlign: "center", background: "rgba(229,9,20,0.1)", padding: "10px", borderRadius: "5px", fontWeight: "bold" }}>
                {error}
              </div>
            )}

            <div>
              <label className={styles.inputLabel}>Email</label>
              <input 
                className={styles.authInput} 
                type="email" 
                placeholder="example@email.com" 
                value={loginForm.email} 
                onChange={e => setLoginForm({ ...loginForm, email: e.target.value })} 
                required
              />
            </div>

            <div>
              <div className={styles.inputLabelRow}>
                <label className={styles.inputLabel}>Mật khẩu</label>
                <Link href="#" className={styles.forgotLink}>Quên mật khẩu?</Link>
              </div>
              <div className={styles.inputWrapper}>
                <input 
                  className={styles.authInput} 
                  type={showPass ? "text" : "password"} 
                  placeholder="••••••••" 
                  value={loginForm.password} 
                  onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} 
                  style={{ paddingRight: 44 }} 
                  required
                />
                <button type="button" className={styles.passToggle} onClick={() => setShowPass(!showPass)}>
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <div className={styles.checkboxWrap} onClick={() => setRemember(!remember)}>
              <div className={`${styles.checkbox} ${remember ? styles.checked : ""}`}>
                {remember && <span style={{ color: "#fff", fontSize: 10 }}>✓</span>}
              </div>
              <span className={styles.checkboxLabel}>Ghi nhớ đăng nhập</span>
            </div>

            <button type="submit" className={styles.btnPrimary} disabled={loading}>
              {loading ? (
                <span><span className="spinner-border spinner-border-sm me-2" role="status"></span>Đang xử lý...</span>
              ) : (
                "Đăng Nhập"
              )}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}