const fs = require('fs');
const path = require('path');
const Customer = require('../models/Customer');

// Run this script with node scripts/cleanupAadhar.js
async function cleanupAadhar() {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const expired = await Customer.find({
    'aadharPdf.uploadDate': { $lte: sevenDaysAgo },
    'aadharPdf.filename': { $exists: true, $ne: null }
  });
  for (const customer of expired) {
    const filePath = path.join(__dirname, '../secure_uploads', customer.aadharPdf.filename);
    try {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      customer.aadharPdf = undefined;
      await customer.save();
      console.log(`Deleted Aadhaar PDF for customer ${customer.name}`);
    } catch (err) {
      console.error(`Error deleting file for ${customer.name}:`, err);
    }
  }
  console.log('Cleanup complete.');
  process.exit();
}

require('../server');
cleanupAadhar();
