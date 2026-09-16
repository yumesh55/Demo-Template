const fs = require('fs');
const path = require('path');
const Customer = require('../models/Customer');

/**
 * Cleanup orphaned Aadhaar PDF files
 * Deletes files from disk that don't have a corresponding database record
 * Also deletes files older than 7 days
 */
async function cleanupAadharFiles() {
  try {
    const uploadsDir = path.join(__dirname, '../secure_uploads');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadsDir)) {
      console.log('No uploads directory found. Nothing to clean.');
      return;
    }

    const files = fs.readdirSync(uploadsDir);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    for (const file of files) {
      const filePath = path.join(uploadsDir, file);
      const stats = fs.statSync(filePath);

      // Check if file is older than 7 days
      if (stats.mtime < sevenDaysAgo) {
        fs.unlinkSync(filePath);
        console.log(`[TTL Cleanup] Deleted expired file: ${file}`);
        continue;
      }

      // Check if file has a corresponding database record
      const customer = await Customer.findOne({ 'aadharPdf.filename': file });
      if (!customer) {
        fs.unlinkSync(filePath);
        console.log(`[Orphan Cleanup] Deleted orphaned file: ${file}`);
      }
    }

    console.log(`[${new Date().toISOString()}] Aadhaar PDF cleanup completed.`);
  } catch (error) {
    console.error('Cleanup job failed:', error);
  }
}

module.exports = cleanupAadharFiles;
