import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isVip: { type: Boolean, default: false },
  vipExpirationDate: { type: Date, default: null },
  watchlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }],
  // Mảng lưu lịch sử xem phim
  viewHistory: [
    {
      movieId: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie' },
      watchedAt: { type: Date, default: Date.now }
    },
  ],

  purchasedMovies: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }
   ],
   isBanned: { type: Boolean, default: false },
   role: { type: String, enum: ['user', 'admin'], default: 'user' },
   vipExpiresAt: { type: Date, default: null },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', userSchema);