const asyncHandler = require('express-async-handler');
const Item = require('../models/itemModel');
const FormDefinition = require('../models/formDefinitionModel');

// @desc    Get all items or items by subcategory
// @route   GET /api/items
// @access  Private
const getItems = asyncHandler(async (req, res) => {
  const { subcategory } = req.query;
  const user = req.user;

  let query = {};
  if (user.role !== 'Superuser') {
    query.vessel = { $in: user.assignedVessels };
  }

  if (subcategory) {
    query.subcategory = subcategory;
  }

  try {
    const items = await Item.find(query).populate('vessel');
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Create new item
// @route   POST /api/items
// @access  Private
const createItem = asyncHandler(async (req, res) => {
  const {
    name,
    category,
    subcategory,
    dueDate,
    title,
    details,
    completed,
    pdfPath,
    vessel,
    customName,
    role,
    formDefinitionId,
    isRecurring,
    recurrenceFrequency,
    recurrenceInterval,
    recurrenceBasis
  } = req.body;

  const attachments = req.files ? req.files.map(file => file.filename) : [];  // Store only the filename

  // Fetch the form definition to get the form_name
  const formDefinition = await FormDefinition.findById(formDefinitionId);
  if (!formDefinition) {
    return res.status(404).json({ message: 'Form definition not found' });
  }

  const itemName = name === 'custom' ? customName : formDefinition.form_name;

  // Validate required fields
  if (!itemName || !category || !dueDate || !vessel || !role || !formDefinitionId) {
    return res.status(400).json({ message: 'All required fields must be filled' });
  }

  // Handle recurrence fields
  const recurrenceData = {};
  if (isRecurring === 'true') {  // 'true' is received as a string from the client
    if (!recurrenceFrequency || !recurrenceInterval || !recurrenceBasis) {
      return res.status(400).json({ message: 'Recurrence fields must be provided for recurring items' });
    }
    recurrenceData.recurrenceFrequency = recurrenceFrequency;
    recurrenceData.recurrenceInterval = Number(recurrenceInterval); // Ensure it's a number
    recurrenceData.recurrenceBasis = recurrenceBasis;
  }

  const newItemData = {
    name: itemName, // Use form_name from FormDefinition
    category,
    subcategory,
    dueDate,
    title,
    details,
    completed,
    attachments,
    pdfPath,
    vessel,
    role,
    formDefinitionId,
    isRecurring: isRecurring === 'true',
    ...recurrenceData // Spread the recurrence data if it's a recurring item
  };

  // Remove undefined fields (to avoid issues with Mongoose validation)
  Object.keys(newItemData).forEach(key => {
    if (newItemData[key] === undefined || newItemData[key] === null) {
      delete newItemData[key];
    }
  });

  const newItem = new Item(newItemData);

  try {
    const createdItem = await newItem.save();
    res.status(201).json(createdItem);
  } catch (error) {
    res.status(400).json({ message: 'Error creating item', error: error.message });
  }
});

// @desc    Delete an item
// @route   DELETE /api/items/:id
// @access  Private
const deleteItem = asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id);

  if (!item) {
    res.status(404).json({ message: 'Item not found' });
    return;
  }

  await item.remove();
  res.json({ message: 'Item removed' });
});

module.exports = {
  getItems,
  createItem,
  deleteItem,
};
