const asyncHandler = require('express-async-handler');
const Vessel = require('../models/vesselModel');

// @desc    Register a new vessel
// @route   POST /api/vessels
// @access  Private/Superuser
const registerVessel = asyncHandler(async (req, res) => {
  try {
    const vesselData = req.body;

    const requiredFields = [
      'name', 'imoNumber', 'flagState', 'grossTonnage', 'regulatoryLength',
      'typeOfRegistration', 'typeOfVessel', 'callSign', 'portOfRegistry', 'numberOfPeople'
    ];

    for (const field of requiredFields) {
      if (!vesselData[field]) {
        res.status(400);
        throw new Error('Please fill in all required fields');
      }
    }

    const vessel = new Vessel(vesselData);
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

// @desc    Get vessel by ID
// @route   GET /api/vessels/:id
// @access  Private (Superuser, Company User, Captain)
const getVesselById = asyncHandler(async (req, res) => {
  try {
    const vessel = await Vessel.findById(req.params.id);

    if (vessel) {
      res.json(vessel);
    } else {
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
  try {
    const vessel = await Vessel.findById(req.params.id);

    if (vessel) {
      Object.assign(vessel, req.body);
      const updatedVessel = await vessel.save();
      res.json(updatedVessel);
    } else {
      res.status(404).json({ message: 'Vessel not found' });
    }
  } catch (error) {
    console.error('Error updating vessel:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Get vessel params
// @route   GET /api/vessels/params
// @access  Private
const getVesselParams = asyncHandler(async (req, res) => {
  try {
    const flagStates = await Vessel.distinct('flagState');
    const typeOfRegistrations = await Vessel.distinct('typeOfRegistration');
    const typeOfVessels = await Vessel.distinct('typeOfVessel');
    const cruisingAreas = ['USA', 'Bahamas', 'Caribbean', 'Mediterranean', 'Canada', 'South Pacific'];

    res.json({
      flagStates,
      typeOfRegistrations,
      typeOfVessels,
      cruisingAreas,
    });
  } catch (error) {
    console.error('Error fetching vessel parameters:', error);
    res.status(500).json({ message: 'Error fetching vessel parameters', error });
  }
});

module.exports = {
  registerVessel,
  getVessels,
  getVesselById,
  updateVessel,
  getVesselParams,
};
