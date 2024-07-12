const asyncHandler = require('express-async-handler');
const FormData = require('../models/formDataModel');
const FormDefinition = require('../models/formDefinitionModel');

// @desc    Get form definition
// @route   GET /api/forms/definitions/:formType
// @access  Private
const getFormDefinition = asyncHandler(async (req, res) => {
  const formDefinition = await FormDefinition.findOne({ form_name: req.params.formType });

  if (!formDefinition) {
    res.status(404);
    throw new Error('Form definition not found');
  }

  res.json(formDefinition);
});

// @desc    Get form data
// @route   GET /api/forms/data/:id
// @access  Private
const getFormData = asyncHandler(async (req, res) => {
  const formData = await FormData.findById(req.params.id);

  if (!formData) {
    res.status(404);
    throw new Error('Form data not found');
  }

  res.json(formData);
});

// @desc    Submit form data
// @route   POST /api/forms/data
// @access  Private
const submitFormData = asyncHandler(async (req, res) => {
  const { formId, fields, completedBy, completedAt } = req.body;

  if (!formId || !fields || !completedBy || !completedAt) {
    console.log('Form submission error: Missing fields', { formId, fields, completedBy, completedAt });
    res.status(400).json({ message: 'All fields are required' });
    return;
  }

  try {
    console.log('Received form submission data:', { formId, fields, completedBy, completedAt });

    const newFormData = new FormData({
      formId,
      fields,
      completedBy,
      completedAt,
    });

    const createdFormData = await newFormData.save();
    console.log('Form data saved successfully:', createdFormData);
    res.status(201).json(createdFormData);
  } catch (error) {
    console.error('Error saving form data:', error);
    res.status(500).json({ message: 'Error saving form data', error });
  }
});

module.exports = {
  getFormDefinition,
  getFormData,
  submitFormData,
};
