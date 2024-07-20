const express = require('express');
const { protect, checkRole } = require('../middleware/authMiddleware');
const {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  getCrewMembers,
  updateUserVessels
} = require('../controllers/userController');

const router = express.Router();

router.post('/login', authUser);
router.post('/register', protect, checkRole, registerUser);
router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);
router.route('/').get(protect, getUsers);
router.route('/crew').get(protect, getCrewMembers);
router.route('/:id/profile').put(protect, updateUserProfile); // Ensure this line exists
router.route('/:id/vessels').put(protect, updateUserVessels);

module.exports = router;
