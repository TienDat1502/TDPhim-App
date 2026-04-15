import mongoose from 'mongoose';
import { type } from 'os';

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subTitle: String,
  quality: String,
  year: Number,
  badge: String,
  emoji: String,
  bgGradient: String,
  isTrailer: { type: Boolean, default: false },
  category: { type: String, required: true },
  videoUrl: String,
  poster: String, // TRƯỜNG BẠN ĐANG CẦN ĐÂY
  price: {type: Number, default: 0}, // Giá phim, mặc định là 0 (miễn phí)
  views: { type: Number, default: 0 },
  rating: { type: Number, default: 10 },
  isVip: { type: Boolean, default: false }, // Mặc định là false (miễn phí)
  isHidden: { type: Boolean, default: false },
  ratings: [
    {
      userId: String,
      score: { type: Number, min: 1, max: 10 }
    }
  ],
  averageRating: { type: Number, default: 0 }
}, { timestamps: true });

// XÓA MODEL CŨ TRONG BỘ NHỚ TRƯỚC KHI EXPORT
delete mongoose.models.Movie;

export default mongoose.model('Movie', movieSchema, 'movies');