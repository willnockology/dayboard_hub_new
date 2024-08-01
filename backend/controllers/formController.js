const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const FormData = require('../models/formDataModel');
const FormDefinition = require('../models/formDefinitionModel');
const Item = require('../models/itemModel');
const Vessel = require('../models/vesselModel');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Function to create PDF from form data
const createPDF = (formData, user) => {
  const doc = new PDFDocument();
  const fileName = `${formData._id}-${Date.now()}.pdf`;
  const filePath = path.join(__dirname, `../uploads/${fileName}`);

  doc.pipe(fs.createWriteStream(filePath));

  doc.fontSize(20).text(`Form: ${formData._id}`, { align: 'center' });
  doc.moveDown();

  formData.fields.forEach((value, key) => {
    doc.fontSize(12).text(`${key}: ${value}`);
    doc.moveDown();
  });

  if (formData.images) {
    formData.images.forEach((image, index) => {
      doc.fontSize(12).text(`Image ${index + 1}: ${image.url}`);
      doc.moveDown();
    });
  }

  doc.fontSize(12).text(`Completed by: ${user.firstName} ${user.lastName}`);
  doc.fontSize(12).text(`Completed at: ${formData.completedAt}`);

  doc.end();

  return `/uploads/${fileName}`;
};

// @desc    Get form definition
// @route   GET /api/forms/definitions/:id
// @access  Private
const getFormDefinition = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid form ID' });
  }

  const formDefinition = await FormDefinition.findById(id);

  if (!formDefinition) {
    return res.status(404).json({ message: 'Form definition not found' });
  }

  res.json(formDefinition);
});

// @desc    Get all form definitions
// @route   GET /api/forms/definitions
// @access  Private
const getFormDefinitions = asyncHandler(async (req, res) => {
  const formDefinitions = await FormDefinition.find({});
  res.json(formDefinitions);
});

// Helper function to parse gross tonnage
const parseGrossTonnage = (gross_tonnage, label) => {
  if (gross_tonnage && gross_tonnage !== 'no min' && gross_tonnage !== 'no max') {
    const parsedValue = parseFloat(gross_tonnage);
    if (isNaN(parsedValue)) {
      throw new Error(`Gross tonnage ${label} must be a valid number`);
    }
    return parsedValue;
  }
  return undefined;
};

// @desc    Create new form definition
// @route   POST /api/forms/definitions
// @access  Private
const createFormDefinition = asyncHandler(async (req, res) => {
  const { form_name, category, fields, subcategory, gross_tonnage_min, gross_tonnage_max, people_min, length_min, flagStates, typeOfRegistrations, typeOfVessels } = req.body;

  console.log('Received request body:', req.body);

  if (!form_name || !category || !fields || !Array.isArray(fields) || !subcategory) {
    return res.status(400).json({ message: 'Form name, category, fields, and subcategory are required' });
  }

  let parsedGrossTonnageMin, parsedGrossTonnageMax;
  try {
    parsedGrossTonnageMin = parseGrossTonnage(gross_tonnage_min, 'min');
    parsedGrossTonnageMax = parseGrossTonnage(gross_tonnage_max, 'max');
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }

  const form = new FormDefinition({
    form_name,
    category,
    fields: fields.map(field => ({
      field_name: field.field_name || '',
      field_description: field.field_description || '',
      field_type: field.field_type || 'text',
      options: ['dropdown', 'radio'].includes(field.field_type) ? field.options || [] : undefined,
      required: field.required || false,
    })),
    subcategory,
    gross_tonnage_min: parsedGrossTonnageMin,
    gross_tonnage_max: parsedGrossTonnageMax,
    people_min: Array.isArray(people_min) ? people_min : [],
    length_min: Array.isArray(length_min) ? length_min : [],
    flagStates: Array.isArray(flagStates) ? flagStates : [],
    typeOfRegistrations: Array.isArray(typeOfRegistrations) ? typeOfRegistrations : [],
    typeOfVessels: Array.isArray(typeOfVessels) ? typeOfVessels : [],
  });

  try {
    const createdForm = await form.save();
    res.status(201).json(createdForm);
  } catch (error) {
    console.error('Error creating form:', error);
    res.status(500).json({ message: 'Error creating form', error });
  }
});

// @desc    Update form definition
// @route   PUT /api/forms/definitions/:id
// @access  Private
const updateFormDefinition = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid form ID' });
  }

  const { form_name, category, fields, subcategory, gross_tonnage_min, gross_tonnage_max, people_min, length_min, flagStates, typeOfRegistrations, typeOfVessels } = req.body;

  console.log('Received request body for update:', req.body);

  if (!form_name || !category || !fields || !Array.isArray(fields) || !subcategory) {
    return res.status(400).json({ message: 'Form name, category, fields, and subcategory are required' });
  }

  let parsedGrossTonnageMin, parsedGrossTonnageMax;
  try {
    parsedGrossTonnageMin = parseGrossTonnage(gross_tonnage_min, 'min');
    parsedGrossTonnageMax = parseGrossTonnage(gross_tonnage_max, 'max');
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }

  const form = await FormDefinition.findById(id);

  if (!form) {
    return res.status(404).json({ message: 'Form definition not found' });
  }

  form.form_name = form_name;
  form.category = category;
  form.fields = fields.map(field => ({
    field_name: field.field_name || '',
    field_description: field.field_description || '',
    field_type: field.field_type || 'text',
    options: ['dropdown', 'radio'].includes(field.field_type) ? field.options || [] : undefined,
    required: field.required || false,
  }));
  form.subcategory = subcategory;
  form.gross_tonnage_min = parsedGrossTonnageMin;
  form.gross_tonnage_max = parsedGrossTonnageMax;
  form.people_min = Array.isArray(people_min) ? people_min : [];
  form.length_min = Array.isArray(length_min) ? length_min : [];
  form.flagStates = Array.isArray(flagStates) ? flagStates : [];
  form.typeOfRegistrations = Array.isArray(typeOfRegistrations) ? typeOfRegistrations : [];
  form.typeOfVessels = Array.isArray(typeOfVessels) ? typeOfVessels : [];

  try {
    const updatedForm = await form.save();
    res.json(updatedForm);
  } catch (error) {
    console.error('Error updating form:', error);
    res.status(500).json({ message: 'Error updating form', error });
  }
});

// @desc    Get form data
// @route   GET /api/forms/data/:id
// @access  Private
const getFormData = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid form data ID' });
  }

  const formData = await FormData.findById(id);

  if (!formData) {
    return res.status(404).json({ message: 'Form data not found' });
  }

  res.json(formData);
});

// @desc    Create a new item
// @route   POST /api/items
// @access  Private
const createItem = asyncHandler(async (req, res) => {
  const { category, subcategory, name, title, dueDate, attachments, vessel } = req.body;
  const role = req.user.role; // Assuming role is added to req.user during authentication

  const newItem = new Item({
    category,
    subcategory: (category === 'Form or Checklist' || category === 'Document') ? subcategory : undefined,
    name: (category === 'Form or Checklist' || category === 'Document') ? name : undefined,
    title: category === 'Track a Date' ? title : undefined,
    dueDate,
    attachments,
    vessel: (role === 'Superuser' || role === 'Company User') ? vessel : undefined,
    role
  });

  try {
    const createdItem = await newItem.save();
    res.status(201).json(createdItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Submit form data
// @route   POST /api/forms/data
// @access  Private
const submitFormData = asyncHandler(async (req, res) => {
  const { formDefinitionId, fields, completedBy, completedAt, itemId } = req.body;
  const user = req.user;

  if (!formDefinitionId || !fields || !completedBy || !completedAt || !itemId) {
    console.log('Form submission error: Missing fields', { formDefinitionId, fields, completedBy, completedAt, itemId });
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    console.log('Received form submission data:', { formDefinitionId, fields, completedBy, completedAt, itemId });

    const newFormData = new FormData({
      formDefinitionId,
      fields,
      completedBy,
      completedAt,
      user: user._id,
      itemId,
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

// @desc    Get categories based on vessel ID and gross tonnage
// @route   GET /api/forms/categories/:vesselId
// @access  Private
const getCategoriesByVessel = asyncHandler(async (req, res) => {
  const { vesselId } = req.params;
  const vessel = await Vessel.findById(vesselId);

  if (!vessel) {
    return res.status(404).json({ message: 'Vessel not found' });
  }

  const grossTonnage = vessel.grossTonnage;
  const categories = await FormDefinition.find({
    $or: [
      { gross_tonnage_min: { $lte: grossTonnage }, gross_tonnage_max: { $gte: grossTonnage } },
      { gross_tonnage_min: { $lte: grossTonnage }, gross_tonnage_max: null },
    ],
  }).distinct('category');

  res.json(categories);
});

// @desc    Get subcategories based on category
// @route   GET /api/forms/subcategories/:category
// @access  Private
const getSubcategoriesByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;

  if (!category) {
    return res.status(400).json({ message: 'Category is required' });
  }

  const subcategories = await FormDefinition.find({ category }).distinct('subcategory');
  
  if (!subcategories) {
    return res.status(404).json({ message: 'No subcategories found' });
  }

  res.json(subcategories);
});

// @desc    Get items based on subcategory
// @route   GET /api/forms/items/:subcategory
// @access  Private
const getItemsBySubcategory = asyncHandler(async (req, res) => {
  const { subcategory } = req.params;

  if (!subcategory) {
    return res.status(400).json({ message: 'Subcategory is required' });
  }

  const items = await FormDefinition.find({ subcategory }).distinct('form_name');

  if (!items || items.length === 0) {
    return res.status(404).json({ message: 'No items found' });
  } else {
    res.json(items);
  }
});

// @desc    Get vessel params
// @route   GET /api/vessels/params
// @access  Private
const getVesselParams = asyncHandler(async (req, res) => {
  try {
    console.log('Fetching distinct flagStates');
    const flagStates = await Vessel.distinct('flagState');
    console.log('Fetching distinct typeOfRegistrations');
    const typeOfRegistrations = await Vessel.distinct('typeOfRegistration');
    console.log('Fetching distinct typeOfVessels');
    const typeOfVessels = await Vessel.distinct('typeOfVessel');

    res.json({
      flagStates,
      typeOfRegistrations,
      typeOfVessels,
    });
  } catch (error) {
    console.error('Error fetching vessel parameters:', error);
    res.status(500).json({ message: 'Error fetching vessel parameters', error });
  }
});

module.exports = {
  getFormDefinition,
  getFormDefinitions,
  createFormDefinition,
  updateFormDefinition,
  getFormData,
  createItem,
  submitFormData,
  getCategoriesByVessel,
  getSubcategoriesByCategory,
  getItemsBySubcategory,
  getVesselParams,
};
