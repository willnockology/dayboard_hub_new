const express = require('express');
const {
  getFormDefinition,
  getFormDefinitions,
  createFormDefinition,
  updateFormDefinition,
  getFormData,
  createItem,
  submitFormData,
  getCategoriesByVessel,
  getSubcategoriesByCategory,
  getItemsByVessel,
  getVesselParams
} = require('../controllers/formController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/definitions/:id').get(protect, getFormDefinition);
router.route('/definitions').get(protect, getFormDefinitions);
router.route('/definitions').post(protect, createFormDefinition);
router.route('/definitions/:id').put(protect, updateFormDefinition);
router.route('/data/:id').get(protect, getFormData);
router.route('/items').post(protect, createItem);
router.route('/data').post(protect, submitFormData);
router.route('/categories/:vesselId').get(protect, getCategoriesByVessel);
router.route('/subcategories/:category').get(protect, getSubcategoriesByCategory);
router.route('/items/:vesselId/:subcategory').get(protect, getItemsByVessel);
router.route('/vessels/params').get(protect, getVesselParams);

module.exports = router;
