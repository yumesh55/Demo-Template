const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, trim: true, unique: true, sparse: true },
  phone: { type: String, required: true },
  aadharPdf: {
    data: Buffer, // PDF file as binary data
    contentType: { type: String, default: 'application/pdf' },
    uploadDate: Date, // for auto-deletion via TTL index
    filename: String, // original filename
    encrypted: Boolean, // for future encryption support
  },
}, { timestamps: true });

// TTL index: automatically delete records 7 days after aadharPdf.uploadDate
CustomerSchema.index(
  { 'aadharPdf.uploadDate': 1 },
  { 
    expireAfterSeconds: 604800, // 7 days in seconds
    sparse: true // only apply to documents with uploadDate
  }
);

module.exports = mongoose.model('Customer', CustomerSchema);
