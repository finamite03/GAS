import mongoose from 'mongoose';

const warehouseSchema = new mongoose.Schema({
  vendorName: { type: String, required: true },
  location: { type: String, required: true },
  managerName: { type: String, required: true },
  addedOn: { type: Date, default: Date.now }
});

export default mongoose.model('Warehouse', warehouseSchema);