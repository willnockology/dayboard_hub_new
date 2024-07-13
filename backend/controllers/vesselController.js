const asyncHandler = require('express-async-handler');
const Vessel = require('../models/vesselModel');

// @desc    Register a new vessel
// @route   POST /api/vessels
// @access  Private (Superuser only)
const registerVessel = asyncHandler(async (req, res) => {
  const { name, imoNumber, flagState, grossTonnage, regulatoryLength, typeOfRegistration } = req.body;

  if (!name || !imoNumber || !flagState || !grossTonnage || !regulatoryLength || !typeOfRegistration) {
    res.status(400);
    throw new Error('Please fill in all fields');
  }

  const vesselExists = await Vessel.findOne({ imoNumber });

  if (vesselExists) {
    res.status(400);
    throw new Error('Vessel already exists');
  }

  const vessel = await Vessel.create({
    name,
    imoNumber,
    flagState,
    grossTonnage,
regulatoryLength,
    typeOfRegistration
  });

  if (vessel) {
    res.status(201).json(vessel);
  } else {
    res.status(400);
    throw new Error('Invalid vessel data');
  }
});

module.exports = { registerVessel };
