const Equipment = require('../models/Equipment');
const Rental = require('../models/Booking');

// Get all equipment with filtering
exports.getAllEquipment = async (req, res) => {
  try {
    const { search, location, page = 1, limit } = req.query;

    let query = { isActive: true };

    if (search) query.name = { $regex: search, $options: 'i' };
    if (location) query.location = location;

    const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
    const requestedLimit = limit === undefined || limit === '' ? 20 : parseInt(limit, 10);
    const isUnlimited = limit === 'all' || limit === 'ALL' || limit === '0' || Number.isNaN(requestedLimit) || requestedLimit <= 0;

    const queryBuilder = Equipment.find(query).sort({ createdAt: -1 });

    if (!isUnlimited) {
      const skip = (parsedPage - 1) * requestedLimit;
      queryBuilder.limit(requestedLimit).skip(skip);
    }

    const [equipment, total] = await Promise.all([
      queryBuilder,
      Equipment.countDocuments(query),
    ]);

    res.json({
      success: true,
      equipment,
      pagination: {
        total,
        pages: isUnlimited ? 1 : Math.ceil(total / requestedLimit),
        currentPage: parsedPage,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Get equipment by ID
exports.getEquipmentById = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);

    if (!equipment) {
      return res.status(404).json({ success: false, error: 'Equipment not found' });
    }

    res.json({ success: true, equipment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Create new equipment (Admin only)
exports.createEquipment = async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, error: 'Only Admin can create equipment' });
    }

    const { name, rentPerDay, quantity, location, description, image, condition } = req.body;

    const equipment = new Equipment({
      name,
      rentPerDay,
      quantity,
      availableQuantity: quantity,
      location,
      description: description || '',
      image: image || null,
      condition: condition || 'Good',
    });

    await equipment.save();
    res.status(201).json({ success: true, equipment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Update equipment (Admin only)
exports.updateEquipment = async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, error: 'Only Admin can update equipment' });
    }

    let equipment = await Equipment.findById(req.params.id);

    if (!equipment) {
      return res.status(404).json({ success: false, error: 'Equipment not found' });
    }

    const updates = { ...req.body };

    if (updates.quantity !== undefined) {
      const quantity = Math.max(parseInt(updates.quantity, 10) || 0, 0);
      const activeRentals = await Rental.aggregate([
        {
          $match: {
            equipment: equipment._id,
            status: 'Active',
          },
        },
        {
          $group: {
            _id: '$equipment',
            rentedQuantity: { $sum: '$quantity' },
          },
        },
      ]);
      const rentedQuantity = activeRentals[0]?.rentedQuantity || 0;

      updates.quantity = quantity;
      updates.availableQuantity = Math.max(quantity - rentedQuantity, 0);
    } else {
      delete updates.availableQuantity;
    }

    equipment = await Equipment.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    res.json({ success: true, equipment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Delete equipment (Admin only)
exports.deleteEquipment = async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, error: 'Only Admin can delete equipment' });
    }

    const equipment = await Equipment.findById(req.params.id);

    if (!equipment) {
      return res.status(404).json({ success: false, error: 'Equipment not found' });
    }

    await Equipment.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Equipment deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
