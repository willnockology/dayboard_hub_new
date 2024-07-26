const asyncHandler = require('express-async-handler');
const Item = require('../models/itemModel');

// @desc    Get all items or items by subcategory
// @route   GET /api/items
// @access  Private
const getItems = asyncHandler(async (req, res) => {
  const { subcategory } = req.query;
  const user = req.user;

  console.log('Request received. User:', user);
  console.log('Query params:', req.query);

  let query = {};
  if (user.role !== 'Superuser') {
    query.vessel = { $in: user.assignedVessels };
  }

  if (subcategory) {
    query.subcategory = subcategory;
  }

  console.log('Query:', query);

  try {
    const items = await Item.find(query).populate('vessel');
    res.json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
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
    formDefinitionId  // Add this line
  } = req.body;

  console.log('Received request body:', req.body);
  console.log('Received files:', req.files);

  const attachments = req.files ? req.files.map(file => file.filename) : [];  // Store only the filename

  const itemName = name === 'custom' ? customName : name;

  if (!itemName || !category || !dueDate || !vessel || !role || !formDefinitionId) {  // Include formDefinitionId in validation
    console.error('Validation error: Missing required fields');
    res.status(400).json({ message: 'All required fields must be filled' });
    return;
  }

  const newItem = new Item({
    name: itemName,
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
    formDefinitionId  // Add this line
  });

  try {
    const createdItem = await newItem.save();
    res.status(201).json(createdItem);
  } catch (error) {
    console.error('Error creating item:', error);
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
