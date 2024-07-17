const asyncHandler = require('express-async-handler');
const Item = require('../models/itemModel');
const User = require('../models/userModel');
const path = require('path');
const fs = require('fs');

// @desc    Fetch all items
// @route   GET /api/items
// @access  Private
const getItems = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('assignedVessels');
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    let items = [];
    if (user.role === 'Superuser') {
      items = await Item.find().populate('vessel');
    } else {
      const vesselIds = user.assignedVessels.map(vessel => vessel._id);
      items = await Item.find({ vessel: { $in: vesselIds } }).populate('vessel');
    }

    res.json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Create an item
// @route   POST /api/items
// @access  Private
const createItem = asyncHandler(async (req, res) => {
  const { name, category, subcategory, dueDate, title, details, attachments, pdfPath, vessel, role } = req.body;

  if (!category || !dueDate || !vessel || !role || (category !== 'Track a Date' && (!name || !subcategory))) {
    res.status(400);
    throw new Error('Missing required fields');
  }

  const item = new Item({
    name,
    category,
    subcategory,
    dueDate,
    title,
    details,
    attachments,
    pdfPath,
    vessel,
    role
  });

  try {
    const createdItem = await item.save();
    res.status(201).json(createdItem);
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = {
  createItem,
};
// @desc    Delete an item
// @route   DELETE /api/items/:id
// @access  Private
const deleteItem = asyncHandler(async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (item) {
      await item.remove();
      res.json({ message: 'Item removed' });
    } else {
      res.status(404);
      throw new Error('Item not found');
    }
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Update an item as completed and add PDF path
// @route   PUT /api/items/:id/complete
// @access  Private
const completeItem = asyncHandler(async (req, res) => {
  try {
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
  } catch (error) {
    console.error('Error completing item:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = {
  getItems,
  createItem,
  deleteItem,
  completeItem,
};
