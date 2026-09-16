const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');

// Create new customer (for rental system - no auth required)
router.post('/customers', userController.createCustomer);

// Search user by phone number
router.get('/search-by-phone', userController.searchByPhone);

// Get current user profile
router.get('/profile', authMiddleware, userController.getUserProfile);

// Get all users (Admin only)
router.get('/', authMiddleware, userController.getAllUsers);

// Update profile
router.put('/profile/update', authMiddleware, userController.updateProfile);

// Update user details (Admin or the user themselves)
router.put('/:id', authMiddleware, userController.updateUser);

// Create new staff user (Admin only)
router.post('/', authMiddleware, userController.createStaffUser);

// Update user role (Admin only)
router.put('/:id/role', authMiddleware, userController.updateUserRole);

// Update user status (Admin only)
router.put('/:id/status', authMiddleware, userController.updateUserStatus);

// Reset user password (Admin only)
router.put('/:id/password', authMiddleware, userController.resetUserPassword);

// Delete user (Admin only)
router.delete('/:id', authMiddleware, userController.deleteUser);

module.exports = router;
