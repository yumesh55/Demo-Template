const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middleware/auth');

router.post('/', authMiddleware, reviewController.createReview);
router.get('/equipment/:equipmentId', reviewController.getEquipmentReviews);
router.get('/user/:userId', reviewController.getUserReviews);

module.exports = router;
