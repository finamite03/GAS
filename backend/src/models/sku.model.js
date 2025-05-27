import mongoose from 'mongoose';

const skuSchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  sku: { type: String, required: true, unique: true },
  uom: { type: String, required: true },
  minLvl: { type: Number, required: true },
  maxLvl: { type: Number, required: true },
  reorderQty: { type: Number, required: true },
  warehouse: { type: String, required: true },
  location: { type: String, required: true },
  openingStock: { type: Number, required: true },
  price: { type: Number, required: true },
  vendor1: String,
  vendor2: String,
  vendor3: String,
  vendor4: String,
  vendor5: String,
  status: { type: String, default: 'Active' },
  currentStock: { type: Number, required: true },
  addedOn: { type: Date, default: Date.now }
});

export default mongoose.model('SKU', skuSchema);