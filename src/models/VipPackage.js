import mongoose from 'mongoose';

const vipPackageSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Ví dụ: Gói Cơ Bản, Gói Premium
  price: { type: Number, required: true }, // Giá tiền: 69000
  durationInDays: { type: Number, required: true }, // Thời hạn: 30 ngày
  features: [{ type: String }], // Các đặc quyền: ["Không quảng cáo", "Chất lượng 4K"]
}, { timestamps: true });

export default mongoose.models.VipPackage || mongoose.model('VipPackage', vipPackageSchema);