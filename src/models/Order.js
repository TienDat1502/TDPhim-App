import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  itemType: { type: String, enum: ["VIP", "MOVIE"], required: true },
  itemId: { type: String }, // ID phim nếu mua lẻ
  amount: { type: Number, required: true },
  status: { type: String, default: "pending" }, // pending, completed, failed
}, { timestamps: true });

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);