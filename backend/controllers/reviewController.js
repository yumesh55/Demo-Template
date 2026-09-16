const Review = require('../models/Review');
const Equipment = require('../models/Equipment');
const User = require('../models/User');

exports.createReview = async (req, res) => {
  try {
    const { equipmentId, rating, comment, aspects, images, type, targetUserId } = req.body;

    const review = new Review({
      equipment: equipmentId,
      renter: type === 'owner' ? targetUserId : req.user.id,
      owner: type === 'owner' ? req.user.id : targetUserId,
      rating,
      comment,
      aspects,
      images: images || [],
      type,
    });

    await review.save();

    // Update equipment rating
    if (type === 'equipment') {
      const reviews = await Review.find({ equipment: equipmentId, type: 'equipment' });
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      
      await Equipment.findByIdAndUpdate(equipmentId, {
        rating: avgRating,
        totalReviews: reviews.length,
      });
    }

    // Update user rating
    if (type === 'owner' || type === 'renter') {
      const targetUser = type === 'owner' ? targetUserId : req.user.id;
      const reviews = await Review.find({
        $or: [
          { owner: targetUser, type: { $in: ['owner', 'renter'] } },
          { renter: targetUser, type: { $in: ['owner', 'renter'] } },
        ],
      });

      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      await User.findByIdAndUpdate(targetUser, {
        rating: avgRating,
        totalReviews: reviews.length,
      });
    }

    res.status(201).json(review);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getEquipmentReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ equipment: req.params.equipmentId, type: 'equipment' })
      .populate('renter', 'name profileImage rating')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      $or: [{ owner: req.params.userId }, { renter: req.params.userId }],
    })
      .populate('renter', 'name profileImage')
      .populate('owner', 'name profileImage')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};
