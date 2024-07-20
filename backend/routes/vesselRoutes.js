const express = require('express');
const { registerVessel, getVessels, getVesselById, updateVessel } = require('../controllers/vesselController');
const { protect, superuser, userOrSuperuser, checkRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/').get(protect, userOrSuperuser, getVessels);
router.route('/').post(protect, superuser, registerVessel);
router.route('/:id').get(protect, userOrSuperuser, getVesselById);
router.route('/:id').put(protect, checkRole, updateVessel);

module.exports = router;
