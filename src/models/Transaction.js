import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  packageId: { type: String, required: true },
  amount: { type: Number, required: true }, // Phải là Number
  paymentMethod: { type: String, default: 'Chuyển khoản QR' },
  status: { type: String, default: 'Thành công' },
  movieId: { type: mongoose.Schema.Types.ObjectId, ref: "Movie" },
}, { timestamps: true });

export default mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);