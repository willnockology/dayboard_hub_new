const asyncHandler = require('express-async-handler');
const Vessel = require('../models/vesselModel');

// @desc    Register a new vessel
// @route   POST /api/vessels
// @access  Private/Superuser
const registerVessel = asyncHandler(async (req, res) => {
  try {
    const {
      name,
      imoNumber,
      flagState,
      grossTonnage,
      regulatoryLength,
      typeOfRegistration,
      typeOfVessel,
      callSign,
      portOfRegistry,
    } = req.body;

    console.log('Registering new vessel with data:', req.body);

    if (
      !name ||
      !imoNumber ||
      !flagState ||
      !grossTonnage ||
      !regulatoryLength ||
      !typeOfRegistration ||
      !typeOfVessel ||
      !callSign ||
      !portOfRegistry
    ) {
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
      typeOfVessel,
      callSign,
      portOfRegistry,
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
    console.log('Fetching all vessels...');
    const vessels = await Vessel.find();
    res.json(vessels);
  } catch (error) {
    console.error('Error fetching vessels:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Get vessel by ID
// @route   GET /api/vessels/:id
// @access  Private (Superuser, Company User, Captain)
const getVesselById = asyncHandler(async (req, res) => {
  try {
    console.log(`Fetching vessel with ID: ${req.params.id}`);
    const vessel = await Vessel.findById(req.params.id);

    if (vessel) {
      console.log('Vessel found:', vessel);
      res.json(vessel);
    } else {
      console.log('Vessel not found');
      res.status(404).json({ message: 'Vessel not found' });
    }
  } catch (error) {
    console.error('Error fetching vessel:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Update vessel details
// @route   PUT /api/vessels/:id
// @access  Private (Superuser, Company User, Captain)
const updateVessel = asyncHandler(async (req, res) => {
  const {
    name,
    imoNumber,
    flagState,
    grossTonnage,
    regulatoryLength,
    typeOfRegistration,
    typeOfVessel,
    callSign,
    portOfRegistry,
  } = req.body;

  try {
    console.log(`Updating vessel with ID: ${req.params.id}`);
    const vessel = await Vessel.findById(req.params.id);

    if (vessel) {
      vessel.name = name || vessel.name;
      vessel.imoNumber = imoNumber || vessel.imoNumber;
      vessel.flagState = flagState || vessel.flagState;
      vessel.grossTonnage = grossTonnage || vessel.grossTonnage;
      vessel.regulatoryLength = regulatoryLength || vessel.regulatoryLength;
      vessel.typeOfRegistration = typeOfRegistration || vessel.typeOfRegistration;
      vessel.typeOfVessel = typeOfVessel || vessel.typeOfVessel;
      vessel.callSign = callSign || vessel.callSign;
      vessel.portOfRegistry = portOfRegistry || vessel.portOfRegistry;

      const updatedVessel = await vessel.save();
      console.log('Vessel updated:', updatedVessel);
      res.json(updatedVessel);
    } else {
      console.log('Vessel not found');
      res.status(404).json({ message: 'Vessel not found' });
    }
  } catch (error) {
    console.error('Error updating vessel:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = {
  registerVessel,
  getVessels,
  getVesselById,
  updateVessel,
};
