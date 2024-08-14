const express = require('express');
const router = express.Router();
const {
  getFormDefinition,
  getFormDefinitions,
  createFormDefinition,
  updateFormDefinition,
  deleteFormDefinition, // Import the deleteFormDefinition function
  getFormData,
  createItem,
  submitFormData,
  getCategoriesByVessel,
  getSubcategoriesByCategory,
  getItemsBySubcategory,
  getVesselParams
} = require('../controllers/formController');

// Define your routes here
router.get('/definitions/:id', getFormDefinition);
router.get('/definitions', getFormDefinitions);
router.post('/definitions', createFormDefinition);
router.put('/definitions/:id', updateFormDefinition);
router.delete('/definitions/:id', deleteFormDefinition); // Add the DELETE route
router.get('/data/:id', getFormData);
router.post('/data', submitFormData);
router.post('/items', createItem);
router.get('/categories/:vesselId', getCategoriesByVessel);
router.get('/subcategories/:category', getSubcategoriesByCategory);
router.get('/items/:subcategory', getItemsBySubcategory);
router.get('/vessels/params', getVesselParams);

module.exports = router;
