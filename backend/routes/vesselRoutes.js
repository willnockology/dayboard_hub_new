const express = require('express');
const { registerVessel, getVessels } = require('../controllers/vesselController');
const { protect, superuser, userOrSuperuser } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/').get(protect, userOrSuperuser, getVessels);
router.route('/').post(protect, superuser, registerVessel);

module.exports = router;
