const asyncHandler = require('express-async-handler');
const Vessel = require('../models/vesselModel');

// @desc    Register a new vessel
// @route   POST /api/vessels
// @access  Private/Superuser
const registerVessel = asyncHandler(async (req, res) => {
  try {
    const { name, imoNumber, flagState, grossTonnage, regulatoryLength, typeOfRegistration } = req.body;

    // Additional logging
    console.log('Registering new vessel with data:', req.body);

    // Validate required fields
    if (!name || !imoNumber || !flagState || !grossTonnage || !regulatoryLength || !typeOfRegistration) {
      res.status(400);
      throw new Error('Please fill in all fields');
    }

    const vessel = new Vessel({
      name,
      imoNumber,
      flagState,
      grossTonnage,
      regulatoryLength,
      typeOfRegistration,
    });

    const createdVessel = await vessel.save();
    res.status(201).json(createdVessel);
  } catch (error) {
    console.error('Error registering vessel:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Get all vessels
// @route   GET /api/vessels
// @access  Private/Superuser
const getVessels = asyncHandler(async (req, res) => {
  try {
    const vessels = await Vessel.find();
    res.json(vessels);
  } catch (error) {
    console.error('Error fetching vessels:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = { registerVessel, getVessels };
