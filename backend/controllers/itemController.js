const asyncHandler = require('express-async-handler');
const Item = require('../models/itemModel');

// @desc    Get all items
// @route   GET /api/items
// @access  Private
const getItems = asyncHandler(async (req, res) => {
  const user = req.user;

  let items;
  if (user.role === 'Superuser') {
    items = await Item.find().populate('vessel');
  } else {
    items = await Item.find({ vessel: { $in: user.assignedVessels } }).populate('vessel');
  }

  res.json(items);
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
  } = req.body;

  console.log('Received request body:', req.body);
  console.log('Received files:', req.files);

  const attachments = req.files ? req.files.map(file => file.filename) : [];  // Store only the filename

  // Ensure that either name or customName is provided
  const itemName = name === 'custom' ? customName : name;

  if (!itemName || !category || !dueDate || !vessel || !role) {
    console.error('Validation error: Missing required fields');
    res.status(400);
    throw new Error('All required fields must be filled');
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
    role
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
    res.status(404);
    throw new Error('Item not found');
  }

  await item.remove();
  res.json({ message: 'Item removed' });
});

module.exports = {
  getItems,
  createItem,
  deleteItem,
};
