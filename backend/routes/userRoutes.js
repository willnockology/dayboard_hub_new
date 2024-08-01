const express = require('express');
const { protect, checkRole } = require('../middleware/authMiddleware');
const {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  getCrewMembers,
  updateUserVessels,
  deleteUser,
  upload, // Import the multer upload middleware
} = require('../controllers/userController');

const router = express.Router();

// Authentication and Registration Routes
router.post('/login', authUser);
router.post('/register', protect, checkRole, upload.single('image'), registerUser); // Apply upload middleware for registration

// User Profile Routes
router.route('/profile').get(protect, getUserProfile);

// User Management Routes
router.route('/')
  .get(protect, getUsers);
router.route('/crew')
  .get(protect, getCrewMembers);
router.route('/:id')
  .get(protect, getUserProfile)  // To fetch a specific user profile if needed
  .put(protect, upload.single('image'), updateUserProfile)  // For updating user profile with image upload
  .delete(protect, checkRole, deleteUser);  // For deleting a user

// Vessel Management Route
router.route('/:id/vessels').put(protect, updateUserVessels);

module.exports = router;
