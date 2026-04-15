import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Movie from '@/models/Movie'; 

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit')) || 0;
    
    // Khai báo các biến nhận diện kiểu lọc
    const isTrending = searchParams.get('trending') === 'true'; 
    const isTopRated = searchParams.get('topRated') === 'true'; 
    const isAdmin = searchParams.get('admin') === 'true';

    let query = {};
    
    // 1. LỌC THỂ LOẠI
    if (category) {
      query.category = category;
    }

    // 2. LOGIC ẨN/HIỆN PHIM
    if (!isAdmin) {
       query.$or = [
          { isHidden: false },
          { isHidden: { $exists: false } }
       ];
    }

    // 3. XỬ LÝ SẮP XẾP
    let sortOption = { createdAt: -1 }; // Mặc định mới nhất
    if (isTrending) {
      sortOption = { views: -1 };
    } else if (isTopRated) {
      // Bổ sung sắp xếp nhiều tầng cho Top Rated để tránh đồng hạng
      sortOption = { averageRating: -1, views: -1, createdAt: -1 }; 
    }

    // ==========================================
    // 4. LẤY DỮ LIỆU TỪ DATABASE
    // ==========================================
    let data = await Movie.find(query).sort(sortOption);

    // ==========================================
    // 5. LỌC TÌM KIẾM KHÔNG DẤU (BẰNG JAVASCRIPT)
    // ==========================================
    if (search) {
      const removeAccents = (str) => {
        if (!str) return "";
        return str
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/đ/g, 'd').replace(/Đ/g, 'D');
      };

      const cleanQuery = removeAccents(search.toLowerCase());

      data = data.filter(movie => {
        const cleanTitle = removeAccents(movie.title.toLowerCase());
        const cleanSubTitle = removeAccents((movie.subTitle || "").toLowerCase());
        
        return cleanTitle.includes(cleanQuery) || cleanSubTitle.includes(cleanQuery);
      });
    }

    // ==========================================
    // 6. GIỚI HẠN SỐ LƯỢNG (LIMIT)
    // ==========================================
    // Cắt mảng bằng JS thay vì limit của MongoDB để đảm bảo số lượng chuẩn sau khi lọc
    if (limit > 0) {
      data = data.slice(0, limit);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Lỗi API Movies:", error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const newMovie = await Movie.create(body);
    return NextResponse.json({ success: true, data: newMovie }, { status: 201 });
  } catch (error) {
    console.error("Lỗi tạo phim:", error);
    return NextResponse.json({ success: false, error: "Lỗi Server" }, { status: 500 });
  }
}

// Đã fix: param -> params
export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const updateMovie = await Movie.findByIdAndUpdate(id, body, { new: true });
    return NextResponse.json(updateMovie);
  } catch (error) {
    console.error("Lỗi cập nhật phim:", error);
    return NextResponse.json({ success: false, error: "Lỗi Server" }, { status: 500 });
  }
}