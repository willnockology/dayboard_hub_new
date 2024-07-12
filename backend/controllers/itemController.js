const asyncHandler = require('express-async-handler');
const Item = require('../models/itemModel');

// @desc    Get items
// @route   GET /api/items
// @access  Private
const getItems = asyncHandler(async (req, res) => {
  const items = await Item.find();
  res.json(items);
});

// @desc    Create new item
// @route   POST /api/items
// @access  Private
const createItem = asyncHandler(async (req, res) => {
  console.log('Received request body:', req.body); // Debug log
  console.log('Received files:', req.files); // Debug log

  const { name, category, subcategory, dueDate, title, details } = req.body;

  if (!name || !category || !subcategory) {
    res.status(400);
    throw new Error('Please add all fields');
  }

  const item = new Item({
    name,
    category,
    subcategory,
    dueDate,
    title,
    details,
    attachments: req.files.map(file => file.filename),
  });

  const createdItem = await item.save();
  res.status(201).json(createdItem);
});

// @desc    Delete item
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
