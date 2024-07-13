const express = require('express');
const router = express.Router();
const { registerUser, authUser, getUserProfile, getUsers, updateUserVessels } = require('../controllers/userController');
const { protect, superuser } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', authUser);
router.get('/profile', protect, getUserProfile);
router.get('/', protect, superuser, getUsers); // Add this route to get all users
router.put('/:id/vessels', protect, superuser, updateUserVessels); // Add this route to update user vessels

module.exports = router;
