const express = require('express');
const router = express.Router();
const {
  registerUser,
  authUser,
  getUserProfile,
  getUsers,
  updateUserVessels
} = require('../controllers/userController');
const { protect, superuser, userOrSuperuser } = require('../middleware/authMiddleware');

// Register a new user
router.post('/register', registerUser);

// Authenticate user and get token
router.post('/login', authUser);

// Get user profile
router.get('/profile', protect, getUserProfile);

// Get all users
router.get('/', protect, superuser, getUsers);

// Update user vessels
router.put('/:id/vessels', protect, superuser, updateUserVessels);

module.exports = router;
