const express = require('express');
const router = express.Router();
const { getFormDefinition, getFormData, submitFormData } = require('../controllers/formController');
const { protect } = require('../middleware/authMiddleware');

router.route('/definitions/:formType').get(protect, getFormDefinition);
router.route('/data/:id').get(protect, getFormData);
router.route('/data').post(protect, submitFormData);  // Ensure the endpoint is /data for POST

module.exports = router;
