import mongoose from 'mongoose';

const supplierSchema = new mongoose.Schema({
  vendorName: { type: String, required: true },
  contactPersonName: { type: String, required: true },
  contactNumber: { type: String, required: true },
  addressLine1: { type: String, required: true },
  addressLine2: String,
  addressLine3: String,
  city: { type: String, required: true },
  state: { type: String, required: true },
  pinCode: { type: String, required: true },
  gstNo: { type: String, required: true },
  emailId: { type: String, required: true },
  whatsappNo: String,
  addedOn: { type: Date, default: Date.now }
});

export default mongoose.model('Supplier', supplierSchema);