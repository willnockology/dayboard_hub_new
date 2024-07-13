const express = require('express');
const { registerVessel, getVessels } = require('../controllers/vesselController');
const { protect, superuser } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/').get(protect, superuser, getVessels); // Add this route to get vessels
router.route('/').post(protect, superuser, registerVessel);

module.exports = router;
