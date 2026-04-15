import Link from "next/link";
import styles from "@/app/phimLe.module.css";

// Tự viết hàm slugify chuẩn tiếng Việt
const slugify = (text) => {
  return text.toString().toLowerCase()
    .replace(/á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, 'a')
    .replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, 'e')
    .replace(/i|í|ì|ỉ|ĩ|ị/gi, 'i')
    .replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, 'o')
    .replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, 'u')
    .replace(/ý|ỳ|ỷ|ỹ|ỵ/gi, 'y')
    .replace(/đ/gi, 'd')
    .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/\-\-+/g, '-').replace(/^-+/, '').replace(/-+$/, '');
};

export default function TrendingCard({ item }) {
  const movieSlug = `${item._id}-${slugify(item.title)}`;
  
  return (
    <Link href={`/phim/${movieSlug}`} className="text-decoration-none">
      <div className="d-flex align-items-start gap-3 mb-3 p-2 rounded hover-bg-dark transition-all">
        
        {/* KHU VỰC ẢNH POSTER NHỎ */}
        <div 
          style={{ 
            width: '65px', 
            height: '95px', 
            flexShrink: 0,
            borderRadius: '6px',
            background: item.bgGradient || '#222',
            backgroundImage: item.poster ? `url(${item.poster})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            border: '1px solid rgba(255,255,255,0.1)'
          }}
          className="shadow-sm d-flex align-items-center justify-content-center"
        >
          {/* Hiện Emoji nếu thiếu ảnh */}
          {!item.poster && <span style={{ fontSize: '24px' }}>{item.emoji}</span>}
        </div>

        {/* THÔNG TIN PHIM BÊN CẠNH */}
        <div className="flex-grow-1 overflow-hidden">
          <h6 
            className="text-white fw-bold mb-1 text-truncate-2" 
            style={{ fontSize: '14px', lineHeight: '1.4' }}
          >
            {item.title}
          </h6>
          
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="text-warning fw-bold" style={{ fontSize: '13px' }}>
              <i className="bi bi-star-fill me-1"></i> {item.rating || '10'}
            </span>
            <span className="text-secondary" style={{ fontSize: '12px' }}>
              {item.year}
            </span>
          </div>

          <div className="text-secondary text-truncate" style={{ fontSize: '12px' }}>
             {item.subTitle}
          </div>
          
          <div className="mt-1">
             <span className="badge bg-secondary opacity-75" style={{ fontSize: '10px' }}>
                {item.badge}
             </span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .hover-bg-dark:hover {
          background-color: rgba(255, 255, 255, 0.05) !important;
          transform: translateX(5px);
        }
        .transition-all {
          transition: all 0.3s ease;
        }
        .text-truncate-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </Link>
  );
}