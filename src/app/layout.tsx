import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css"; 
// Import 2 component bạn vừa tạo
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "MotchillTV - Xem Phim Online",
  description: "Xem phim online miễn phí chất lượng cao",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>
        {/* 1. Gọi Header ở đây */}
        <Header />
        {/* <div id="fb-root"></div>
        <script async defer crossOrigin="anonymous" src="https://connect.facebook.net/vi_VN/sdk.js#xfbml=1&version=v22.0"></script> */}
        {/* 2. Nội dung các trang (Trang chủ, Phim Lẻ...) sẽ thay đổi ở khu vực này */}
        {children}

        {/* 3. Gọi Footer ở đây */}
        <Footer />

        <Script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}