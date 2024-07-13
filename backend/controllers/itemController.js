const asyncHandler = require('express-async-handler');
const Item = require('../models/itemModel');

// @desc    Get items
// @route   GET /api/items
// @access  Private
const getItems = asyncHandler(async (req, res) => {
  const user = req.user;
  let items;

  if (user.role === 'Company User') {
    items = await Item.find({ vessel: { $in: user.assignedVessels } }).populate('vessel');
  } else if (user.role === 'Captain' || user.role === 'Crew') {
    items = await Item.find({ vessel: user.assignedVessels[0] }).populate('vessel');
  } else {
    items = await Item.find().populate('vessel');
  }

  res.json(items);
});

// @desc    Create new item
// @route   POST /api/items
// @access  Private
const createItem = asyncHandler(async (req, res) => {
  console.log('Received request body:', req.body); // Debug log
  console.log('Received files:', req.files); // Debug log

  const { name, category, subcategory, dueDate, title, details, vessel } = req.body;

  if (!name || !category || !subcategory || !vessel) {
    res.status(400);
    throw new Error('Please add all fields');
  }

  try {
    const item = new Item({
      name,
      category,
      subcategory,
      dueDate,
      title,
      details,
      vessel,
      attachments: req.files.map(file => file.filename),
    });

    const createdItem = await item.save();
    res.status(201).json(createdItem);
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ message: 'Server error while creating item', error: error.message });
  }
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
