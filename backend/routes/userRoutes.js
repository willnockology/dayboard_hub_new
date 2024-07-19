const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  updateUserVessels
} = require('../controllers/userController');

const router = express.Router();

router.post('/login', authUser);
router.post('/register', registerUser);
router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);
router.route('/').get(protect, getUsers);
router.route('/:id/vessels').put(protect, updateUserVessels);

module.exports = router;
