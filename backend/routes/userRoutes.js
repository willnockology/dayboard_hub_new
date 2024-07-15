const express = require('express');
const router = express.Router();
const { registerUser, authUser, getUserProfile, getUsers, updateUserVessels } = require('../controllers/userController');
const { protect, superuser, userOrSuperuser } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', authUser);
router.get('/profile', protect, getUserProfile);
router.get('/', protect, superuser, getUsers);
router.put('/:id/vessels', protect, superuser, updateUserVessels);

module.exports = router;
