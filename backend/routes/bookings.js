const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const authMiddleware = require('../middleware/auth');

// Create a new rental
router.post('/', authMiddleware, bookingController.createRental);

// Get all rentals
router.get('/', authMiddleware, bookingController.getRentals);

// Get rental by ID
router.get('/:id', authMiddleware, bookingController.getRentalById);

// Return equipment
router.put('/:id/return', authMiddleware, bookingController.returnEquipment);

// Cancel rental
router.put('/:id/cancel', authMiddleware, bookingController.cancelRental);

// Update rental
router.put('/:id', authMiddleware, bookingController.updateRental);

module.exports = router;
