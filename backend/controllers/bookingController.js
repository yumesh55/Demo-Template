const Rental = require('../models/Booking');
const Equipment = require('../models/Equipment');

// Create a new rental
exports.createRental = async (req, res) => {
  try {
    const { equipmentId, customerName, customerPhone, startDate, notes } = req.body;
    const quantity = parseInt(req.body.quantity, 10);

    if (!quantity || quantity < 1) {
      return res.status(400).json({ success: false, error: 'Quantity must be at least 1' });
    }

    // Validate equipment exists
    const equipment = await Equipment.findById(equipmentId);
    if (!equipment) {
      return res.status(404).json({ success: false, error: 'Equipment not found' });
    }

    // Check if enough quantity is available
    if (equipment.availableQuantity < quantity) {
      return res.status(400).json({ 
        success: false, 
        error: `Only ${equipment.availableQuantity} units available` 
      });
    }

    // Create rental without endDate (will be set when returning equipment)
    const rental = new Rental({
      equipment: equipmentId,
      quantity,
      customerName,
      customerPhone,
      startDate,
      rentPerDay: equipment.rentPerDay,
      status: 'Active',
      createdBy: req.user.id,
      notes: notes || '',
    });

    await rental.save();

    // Update equipment available quantity
    equipment.availableQuantity = Math.max(equipment.availableQuantity - quantity, 0);
    await equipment.save();

    res.status(201).json({ success: true, rental });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Get all rentals
exports.getRentals = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    let query = {};
    if (status) query.status = status;

    const skip = (page - 1) * limit;
    const rentals = await Rental.find(query)
      .populate('equipment', 'name rentPerDay location')
      .populate('createdBy', 'name email')
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await Rental.countDocuments(query);

    res.json({
      success: true,
      rentals,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: parseInt(page),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Get rental by ID
exports.getRentalById = async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id)
      .populate('equipment')
      .populate('createdBy', 'name email');

    if (!rental) {
      return res.status(404).json({ success: false, error: 'Rental not found' });
    }

    res.json({ success: true, rental });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Return equipment
exports.returnEquipment = async (req, res) => {
  try {
    let { endDate } = req.body;
    
    console.log('Return request - endDate:', endDate);
    
    const rental = await Rental.findById(req.params.id).populate('equipment');

    if (!rental) {
      return res.status(404).json({ success: false, error: 'Rental not found' });
    }

    if (rental.status !== 'Active') {
      return res.status(400).json({ success: false, error: 'Rental already completed' });
    }

    // Validate endDate
    if (!endDate || endDate.trim === undefined ? !endDate : !endDate.trim()) {
      return res.status(400).json({ success: false, error: 'Return date is required' });
    }

    // Parse endDate properly
    endDate = new Date(endDate);
    if (isNaN(endDate.getTime())) {
      return res.status(400).json({ success: false, error: 'Invalid date format' });
    }

    // Calculate rental details using endDate
    const start = new Date(rental.startDate);
    const end = new Date(endDate);
    
    if (end < start) {
      return res.status(400).json({ success: false, error: 'Return date cannot be before start date' });
    }
    
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    const totalAmount = totalDays * rental.rentPerDay * rental.quantity;

    // Return equipment quantity
    const equipment = rental.equipment;
    equipment.availableQuantity = Math.min(
      (Number(equipment.availableQuantity) || 0) + rental.quantity,
      Number(equipment.quantity) || 0
    );
    await equipment.save();

    // Mark rental as completed and set endDate
    rental.endDate = endDate;
    rental.totalDays = totalDays;
    rental.totalAmount = totalAmount;
    rental.status = 'Completed';
    rental.returnedAt = new Date();
    await rental.save();

    res.json({ success: true, message: 'Equipment returned successfully', rental });
  } catch (error) {
    console.error('Error in returnEquipment:', error);
    res.status(500).json({ success: false, error: error.message || 'Server error' });
  }
};

// Cancel rental (for Staff/Admin)
exports.cancelRental = async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id).populate('equipment');

    if (!rental) {
      return res.status(404).json({ success: false, error: 'Rental not found' });
    }

    if (rental.status !== 'Active') {
      return res.status(400).json({ success: false, error: 'Cannot cancel completed rental' });
    }

    // Return equipment quantity
    const equipment = rental.equipment;
    equipment.availableQuantity = Math.min(
      (Number(equipment.availableQuantity) || 0) + rental.quantity,
      Number(equipment.quantity) || 0
    );
    await equipment.save();

    // Mark rental as cancelled
    rental.status = 'Cancelled';
    await rental.save();

    res.json({ success: true, message: 'Rental cancelled', rental });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Update rental (only certain fields)
exports.updateRental = async (req, res) => {
  try {
    const { customerName, customerPhone, notes } = req.body;
    let rental = await Rental.findById(req.params.id);

    if (!rental) {
      return res.status(404).json({ success: false, error: 'Rental not found' });
    }

    if (customerName) rental.customerName = customerName;
    if (customerPhone) rental.customerPhone = customerPhone;
    if (notes !== undefined) rental.notes = notes;

    await rental.save();
    res.json({ success: true, rental });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
