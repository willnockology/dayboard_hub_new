const asyncHandler = require('express-async-handler');
const Item = require('../models/itemModel');
const path = require('path');
const fs = require('fs');

// @desc    Fetch all items
// @route   GET /api/items
// @access  Private
const getItems = asyncHandler(async (req, res) => {
  const items = await Item.find().populate('vessel');
  res.json(items);
});

// @desc    Create an item
// @route   POST /api/items
// @access  Private
const createItem = asyncHandler(async (req, res) => {
  const { name, category, subcategory, dueDate, title, details, vessel } = req.body;

  const item = new Item({
    name,
    category,
    subcategory,
    dueDate,
    title,
    details,
    vessel,
  });

  if (req.files) {
    item.attachments = req.files.map((file) => file.filename);
  }

  const createdItem = await item.save();
  res.status(201).json(createdItem);
});

// @desc    Delete an item
// @route   DELETE /api/items/:id
// @access  Private
const deleteItem = asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id);

  if (item) {
    await item.remove();
    res.json({ message: 'Item removed' });
  } else {
    res.status(404);
    throw new Error('Item not found');
  }
});

// @desc    Update an item as completed and add PDF path
// @route   PUT /api/items/:id/complete
// @access  Private
const completeItem = asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id);

  if (item) {
    item.completed = true;
    if (req.body.pdfPath) {
      item.pdfPath = req.body.pdfPath;
    }
    const updatedItem = await item.save();
    res.json(updatedItem);
  } else {
    res.status(404);
    throw new Error('Item not found');
  }
});

module.exports = {
  getItems,
  createItem,
  deleteItem,
  completeItem,
};
