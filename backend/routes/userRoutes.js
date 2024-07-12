const express = require('express');
const router = express.Router();
const { registerUser, authUser, getUserProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', authUser); // Ensure the function name matches what is exported
router.get('/profile', protect, getUserProfile);

module.exports = router;
