const asyncHandler = require('express-async-handler');
const FormData = require('../models/formDataModel');
const FormDefinition = require('../models/formDefinitionModel');
const Item = require('../models/itemModel');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Function to create PDF from form data
const createPDF = (formData, user) => {
  const doc = new PDFDocument();
  const fileName = `${formData.formId}-${Date.now()}.pdf`;
  const filePath = path.join(__dirname, `../uploads/${fileName}`);

  doc.pipe(fs.createWriteStream(filePath));

  doc.fontSize(20).text(`Form: ${formData.formId}`, { align: 'center' });
  doc.moveDown();

  formData.fields.forEach((value, key) => {
    doc.fontSize(12).text(`${key}: ${value}`);
    doc.moveDown();
  });

  doc.fontSize(12).text(`Completed by: ${user.firstName} ${user.lastName}`);
  doc.fontSize(12).text(`Completed at: ${formData.completedAt}`);

  doc.end();

  return `/uploads/${fileName}`;  // Ensure relative path
};

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
  const { formId, fields, completedBy, completedAt, itemId } = req.body;
  const user = req.user; // Assuming user is available in req.user from auth middleware

  if (!formId || !fields || !completedBy || !completedAt || !itemId) {
    console.log('Form submission error: Missing fields', { formId, fields, completedBy, completedAt, itemId });
    res.status(400).json({ message: 'All fields are required' });
    return;
  }

  try {
    console.log('Received form submission data:', { formId, fields, completedBy, completedAt, itemId });

    const newFormData = new FormData({
      formId,
      fields,
      completedBy,
      completedAt,
      user: user._id,
      itemId,  // Save itemId in FormData
    });

    const createdFormData = await newFormData.save();
    console.log('Form data saved successfully:', createdFormData);

    // Create PDF
    const pdfPath = createPDF(createdFormData, user);
    createdFormData.pdfPath = pdfPath;
    createdFormData.completed = true;
    const updatedFormData = await createdFormData.save();
    console.log('PDF created at path:', pdfPath);

    // Update the corresponding item with the pdfPath
    const item = await Item.findById(itemId);
    if (item) {
      item.pdfPath = pdfPath;
      item.completed = true;
      const updatedItem = await item.save();
      console.log('Item updated successfully with pdfPath:', updatedItem);
    } else {
      console.error('Item not found:', itemId);
    }

    res.status(201).json(updatedFormData);
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
