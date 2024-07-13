const express = require('express');
const router = express.Router();
const { registerVessel } = require('../controllers/vesselController');
const { protect, superuser } = require('../middleware/authMiddleware');

router.route('/').post(protect, superuser, registerVessel);

module.exports = router;
