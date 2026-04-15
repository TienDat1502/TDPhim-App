"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Thêm dòng này
import styles from "../dndk.module.css";

export default function RegisterPage() {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({ username: "", email: "", password: "", confirm: "" });
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState(""); // Thêm state báo lỗi
  const [loading, setLoading] = useState(false);

  // Tính độ mạnh mật khẩu (giữ nguyên)
  let score = 0;
  if (form.password.length >= 8) score++;
  if (/[A-Z]/.test(form.password)) score++;
  if (/[0-9]/.test(form.password)) score++;
  if (/[^A-Za-z0-9]/.test(form.password)) score++;
  const strengthColors = ["", "#e50914", "#e67e00", "#f5c518", "#27ae60"];
  const strengthLabels = ["", "Yếu", "Trung bình", "Khá", "Mạnh"];

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.username || !form.email || !form.password) {
      return setError("Vui lòng điền đầy đủ thông tin!");
    }
    if (form.password !== form.confirm) {
      return setError("Mật khẩu không khớp!");
    }
    if (!agree) {
      return setError("Bạn cần đồng ý với điều khoản!");
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();

      if (data.success) {
        alert("Đăng ký thành công! Đang chuyển đến trang đăng nhập...");
        router.push("/login");
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Có lỗi xảy ra, vui lòng thử lại sau.");
    } finally {
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
            <Link href="/login" className={`${styles.tabBtn} ${styles.tabInactive}`}>Đăng Nhập</Link>
            <Link href="/register" className={`${styles.tabBtn} ${styles.tabActive}`}>Đăng Ký</Link>
          </div>
          
          <form className={styles.formPadding} onSubmit={handleRegister}>
            {error && <div style={{ color: "#e50914", fontSize: "14px", marginBottom: "15px", textAlign: "center", background: "rgba(229,9,20,0.1)", padding: "10px", borderRadius: "5px" }}>{error}</div>}
            <div>
              <label className={styles.inputLabel}>Tên người dùng</label>
              <input className={styles.authInput} type="text" placeholder="Tên hiển thị của bạn" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
            </div>

            <div>
              <label className={styles.inputLabel}>Email</label>
              <input className={styles.authInput} type="email" placeholder="example@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>

            <div>
              <label className={styles.inputLabel}>Mật khẩu</label>
              <div className={styles.inputWrapper}>
                <input className={styles.authInput} type={showPass ? "text" : "password"} placeholder="Tối thiểu 8 ký tự" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} style={{ paddingRight: 44 }} />
                <button type="button" className={styles.passToggle} onClick={() => setShowPass(!showPass)}>{showPass ? "🙈" : "👁️"}</button>
              </div>
            </div>

            <div>
              <label className={styles.inputLabel}>Xác nhận mật khẩu</label>
              <div className={styles.inputWrapper}>
                <input className={styles.authInput} type={showConfirm ? "text" : "password"} placeholder="Nhập lại mật khẩu" value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} style={{ paddingRight: 44, borderColor: form.confirm && form.confirm !== form.password ? "#e50914" : undefined }} />
                <button type="button" className={styles.passToggle} onClick={() => setShowConfirm(!showConfirm)}>{showConfirm ? "🙈" : "👁️"}</button>
              </div>
            </div>

            <div className={styles.checkboxWrap} onClick={() => setAgree(!agree)}>
              <div className={`${styles.checkbox} ${agree ? styles.checked : ""}`} style={{ marginTop: 2 }}>{agree && <span style={{ color: "#fff", fontSize: 10 }}>✓</span>}</div>
              <span className={styles.checkboxLabelSmall}>
                Tôi đồng ý với <Link href="#" className={styles.linkAccent}>Điều khoản</Link> và <Link href="#" className={styles.linkAccent}>Chính sách</Link>
              </span>
            </div>

            <button type="submit" className={styles.btnPrimary} disabled={loading}>
              {loading ? "Đang xử lý..." : "Tạo Tài Khoản"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}