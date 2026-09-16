const express = require('express');
const router = express.Router();
const multer = require('multer');
const Customer = require('../models/Customer');
const { ensureAdmin } = require('../middleware/auth');

// Configure multer for in-memory storage (we'll save to MongoDB)
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed!'));
    }
    if (!file.originalname.match(/\.pdf$/i)) {
      return cb(new Error('File extension must be .pdf'));
    }
    cb(null, true);
  },
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB max
});

// Get customer by phone (for autocomplete in rentals) - No auth required
router.get('/search-by-phone', async (req, res) => {
  try {
    const { phone } = req.query;
    if (!phone) {
      return res.status(400).json({ error: 'Phone number required' });
    }
    const customer = await Customer.findOne({ phone }).select('name email phone _id');
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json({ success: true, user: customer });
  } catch (err) {
    res.status(500).json({ error: 'Failed to search customer' });
  }
});

// Get all customers (Admin only)
router.get('/', ensureAdmin, async (req, res) => {
  try {
    const customers = await Customer.find().select('name email phone aadharPdf _id createdAt');
    res.json({ success: true, customers });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// Get customer by ID (Admin only)
router.get('/:id', ensureAdmin, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).select('name email phone aadharPdf _id createdAt');
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json({ success: true, customer });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
});

// View Aadhaar PDF (Admin only)
router.get('/:id/aadhar', ensureAdmin, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer || !customer.aadharPdf || !customer.aadharPdf.data) {
      return res.status(404).json({ error: 'Aadhaar PDF not found' });
    }
    res.setHeader('Content-Type', customer.aadharPdf.contentType || 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="aadhar.pdf"');
    res.send(customer.aadharPdf.data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch Aadhaar PDF' });
  }
});

// Delete Aadhaar PDF (Admin only)
router.delete('/:id/aadhar', ensureAdmin, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer || !customer.aadharPdf || !customer.aadharPdf.data) {
      return res.status(404).json({ error: 'Aadhaar PDF not found' });
    }
    customer.aadharPdf = undefined;
    await customer.save();
    res.json({ message: 'Aadhaar PDF deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete Aadhaar PDF' });
  }
});

// Add customer with Aadhaar PDF (Admin only)
router.post('/add', ensureAdmin, upload.single('aadharPdf'), async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and phone are required.' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'Aadhaar PDF required' });
    }

    const customerData = {
      name: name.trim(),
      phone: phone.trim(),
      aadharPdf: {
        data: req.file.buffer, // Store PDF as binary in MongoDB
        contentType: req.file.mimetype,
        filename: req.file.originalname,
        uploadDate: new Date(),
        encrypted: false
      }
    };

    if (email) {
      customerData.email = email.trim();
    }

    const customer = new Customer(customerData);
    await customer.save();
    res.status(201).json({ message: 'Customer added', customer: { _id: customer._id, name: customer.name } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update customer details (Admin only)
router.put('/:id', ensureAdmin, async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    if (name) customer.name = name.trim();
    if (email) customer.email = email.trim();
    if (phone) customer.phone = phone.trim();

    await customer.save();
    res.json({ message: 'Customer updated', customer: { _id: customer._id, name: customer.name, email: customer.email, phone: customer.phone } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete customer (Admin only)
router.delete('/:id', ensureAdmin, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Delete from MongoDB (Aadhaar PDF data is included in document)
    await Customer.findByIdAndDelete(req.params.id);
    res.json({ message: 'Customer deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
