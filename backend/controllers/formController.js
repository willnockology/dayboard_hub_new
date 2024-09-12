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
        return res.status(400).json({ message: 'Invalid formDefinition ID provided' });
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

// @desc    Create new form definition
// @route   POST /api/forms/definitions
// @access  Private
const createFormDefinition = asyncHandler(async (req, res) => {
    const {
        form_name,
        category,
        fields,
        subcategory,
        applicableVesselTypes,
        applicableFlagStates,
        applicableRegistrations,
        gross_tonnage_min,
        gross_tonnage_max,
        length_min,
        length_max,
        hiddenVessels
    } = req.body;

    if (!form_name || !category || !fields || !Array.isArray(fields) || !subcategory) {
        return res.status(400).json({ message: 'Form name, category, fields, and subcategory are required' });
    }

    let parsedGrossTonnageMin, parsedGrossTonnageMax;
    try {
        parsedGrossTonnageMin = parseFloat(gross_tonnage_min) || undefined;
        parsedGrossTonnageMax = parseFloat(gross_tonnage_max) || undefined;
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
        applicableVesselTypes: Array.isArray(applicableVesselTypes) ? applicableVesselTypes : [],
        applicableFlagStates: Array.isArray(applicableFlagStates) ? applicableFlagStates : [],
        applicableRegistrations: Array.isArray(applicableRegistrations) ? applicableRegistrations : [],
        gross_tonnage_min: parsedGrossTonnageMin,
        gross_tonnage_max: parsedGrossTonnageMax,
        length_min: length_min || null,
        length_max: length_max || null,
        hiddenVessels: Array.isArray(hiddenVessels) ? hiddenVessels : [],
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

    const {
        form_name,
        category,
        fields,
        subcategory,
        applicableVesselTypes,
        applicableFlagStates,
        applicableRegistrations,
        gross_tonnage_min,
        gross_tonnage_max,
        length_min,
        length_max,
        hiddenVessels
    } = req.body;

    if (!form_name || !category || !fields || !Array.isArray(fields) || !subcategory) {
        return res.status(400).json({ message: 'Form name, category, fields, and subcategory are required' });
    }

    let parsedGrossTonnageMin, parsedGrossTonnageMax;
    try {
        parsedGrossTonnageMin = parseFloat(gross_tonnage_min) || undefined;
        parsedGrossTonnageMax = parseFloat(gross_tonnage_max) || undefined;
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
    form.applicableVesselTypes = Array.isArray(applicableVesselTypes) ? applicableVesselTypes : [];
    form.applicableFlagStates = Array.isArray(applicableFlagStates) ? applicableFlagStates : [];
    form.applicableRegistrations = Array.isArray(applicableRegistrations) ? applicableRegistrations : [];
    form.gross_tonnage_min = parsedGrossTonnageMin;
    form.gross_tonnage_max = parsedGrossTonnageMax;
    form.length_min = length_min || null;
    form.length_max = length_max || null;
    form.hiddenVessels = Array.isArray(hiddenVessels) ? hiddenVessels : [];

    try {
        const updatedForm = await form.save();
        res.json(updatedForm);
    } catch (error) {
        console.error('Error updating form:', error);
        res.status(500).json({ message: 'Error updating form', error });
    }
});

// @desc    Delete form definition
// @route   DELETE /api/forms/definitions/:id
// @access  Private
const deleteFormDefinition = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid form ID' });
    }

    const form = await FormDefinition.findById(id);

    if (!form) {
        return res.status(404).json({ message: 'Form definition not found' });
    }

    await form.remove();
    res.json({ message: 'Form removed successfully' });
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
    const role = req.user.role;

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
  console.log("User Info in submitFormData:", req.user);
  const { formDefinitionId, fields, completedAt, itemId, location } = req.body;
  const user = req.user;

  if (!user || !user.username) {
      return res.status(400).json({ message: 'User information is missing or incomplete' });
  }

  if (!location || !location.lat || !location.long) {
      return res.status(400).json({ message: 'Location data is missing or incomplete' });
  }

  try {
      console.log('Form Submission Data:', { formDefinitionId, fields, completedAt, itemId, location, user });

      const item = await Item.findById(itemId);
      if (!item) {
          console.error('Item not found for itemId:', itemId);
          return res.status(404).json({ message: 'Item not found' });
      }

      const newFormData = new FormData({
          formDefinitionId,
          fields,
          completedBy: user.username,
          completedAt,
          user: user._id,
          itemId,
          location: {
              lat: location.lat,
              long: location.long,
          },
      });

      const savedFormData = await newFormData.save();
      console.log('Created FormData after saving:', savedFormData);

      const pdfPath = createPDF(savedFormData, user);
      if (!pdfPath) {
          throw new Error('PDF creation failed');
      }
      savedFormData.pdfPath = pdfPath;
      savedFormData.completed = true;

      const updatedFormData = await savedFormData.save();
      console.log('Updated FormData with PDF path:', updatedFormData);

      item.pdfPath = pdfPath;
      item.completed = true;
      const updatedItem = await item.save();
      console.log('Updated Item after adding PDF path:', updatedItem);

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
        const flagStates = await Vessel.distinct('flagState');
        const typeOfRegistrations = await Vessel.distinct('typeOfRegistration');
        const typeOfVessels = await Vessel.distinct('typeOfVessel');

        res.json({
            flagStates,
            typeOfRegistrations,
            typeOfVessels,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching vessel parameters', error });
    }
});

module.exports = {
    getFormDefinition,
    getFormDefinitions,
    createFormDefinition,
    updateFormDefinition,
    deleteFormDefinition,
    getFormData,
    createItem,
    submitFormData,
    getCategoriesByVessel,
    getSubcategoriesByCategory,
    getItemsBySubcategory,
    getVesselParams,
};
