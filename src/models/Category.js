import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // Tên danh mục (Hành động, Hài...)
  description: { type: String } // Mô tả ngắn gọn
}, { timestamps: true });

export default mongoose.models.Category || mongoose.model("Category", categorySchema);