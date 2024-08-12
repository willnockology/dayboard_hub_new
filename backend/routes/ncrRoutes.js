const express = require('express');
const {
  createNCR,
  getNCRs,
  getNCRById,
  updateNCR,
  deleteNCR,
} = require('../controllers/ncrController');
const { protect, userOrSuperuser, checkRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Routes for NCR management
router.route('/')
  .post(protect, checkRole, createNCR)  // Only authenticated users with appropriate roles can create an NCR
  .get(protect, userOrSuperuser, getNCRs);  // Authenticated users with specific roles can view all NCRs

router.route('/:id')
  .get(protect, userOrSuperuser, getNCRById)  // Authenticated users with specific roles can view a specific NCR
  .put(protect, checkRole, updateNCR)  // Only authenticated users with appropriate roles can update an NCR
  .delete(protect, checkRole, deleteNCR);  // Only authenticated users with appropriate roles can delete an NCR

module.exports = router;
