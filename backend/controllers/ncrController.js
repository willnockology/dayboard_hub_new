const asyncHandler = require('express-async-handler');
const NonConformityReport = require('../models/ncrModel');
const Vessel = require('../models/vesselModel');
const Counter = require('../models/counterModel'); // Import the Counter model

// @desc    Create a new NCR
// @route   POST /api/ncrs
// @access  Private
const createNCR = asyncHandler(async (req, res) => {
  const {
    vessel,
    date,
    description,
    rootCause,
    correctiveAction,
    dueDate,
    closedDate,
  } = req.body;

  // Ensure 'reportedBy' is set from the authenticated user's ID
  const reportedBy = req.user._id;

  // Find the vessel by ID
  const foundVessel = await Vessel.findById(vessel);
  if (!foundVessel) {
    res.status(404);
    throw new Error('Vessel not found');
  }

  // Find the last NCR for this vessel and generate the next report number
  const lastNCR = await NonConformityReport.findOne({ vessel })
    .sort({ createdAt: -1 });

  let nextReportNumber = 'NCR001';
  if (lastNCR) {
    const lastReportNumber = lastNCR.reportNumber;
    const lastNumber = parseInt(lastReportNumber.replace('NCR', ''), 10);
    nextReportNumber = `NCR${String(lastNumber + 1).padStart(3, '0')}`;
  }

  // Create the NCR document
  const ncr = new NonConformityReport({
    vessel,
    reportNumber: nextReportNumber,
    date,
    reportedBy, // Set the 'reportedBy' field as ObjectId
    description,
    rootCause,
    correctiveAction,
    status: correctiveAction ? 'Pending DPA Sign Off' : 'Open', // Set status based on corrective action
    dueDate,
    closedDate,
  });

  const createdNCR = await ncr.save();
  res.status(201).json(createdNCR);
});

// @desc    Fetch all NCRs
// @route   GET /api/ncrs
// @access  Private
const getNCRs = asyncHandler(async (req, res) => {
  const ncrs = await NonConformityReport.find()
    .populate('vessel')
    .populate('reportedBy', 'firstName lastName email'); // Populate reportedBy with user details
  res.json(ncrs);
});

// @desc    Fetch a single NCR by id
// @route   GET /api/ncrs/:id
// @access  Private
const getNCRById = asyncHandler(async (req, res) => {
  const ncr = await NonConformityReport.findById(req.params.id)
    .populate('vessel')
    .populate('reportedBy', 'firstName lastName email');

  if (ncr) {
    res.json(ncr);
  } else {
    res.status(404);
    throw new Error('NCR not found');
  }
});

// @desc    Update an existing NCR
// @route   PUT /api/ncrs/:id
// @access  Private
const updateNCR = asyncHandler(async (req, res) => {
  const {
    date,
    description,
    rootCause,
    correctiveAction,
    dueDate,
    closedDate,
  } = req.body;

  const ncr = await NonConformityReport.findById(req.params.id);

  if (ncr) {
    ncr.date = date || ncr.date;
    ncr.description = description || ncr.description;
    ncr.rootCause = rootCause || ncr.rootCause;
    ncr.correctiveAction = correctiveAction || ncr.correctiveAction;
    ncr.status = correctiveAction ? 'Pending DPA Sign Off' : ncr.status; // Update status based on corrective action
    ncr.dueDate = dueDate || ncr.dueDate;
    ncr.closedDate = closedDate || ncr.closedDate;

    const updatedNCR = await ncr.save();
    res.json(updatedNCR);
  } else {
    res.status(404);
    throw new Error('NCR not found');
  }
});

// @desc    Delete an NCR
// @route   DELETE /api/ncrs/:id
// @access  Private
const deleteNCR = asyncHandler(async (req, res) => {
  const ncr = await NonConformityReport.findById(req.params.id);

  if (ncr) {
    await ncr.remove();
    res.json({ message: 'NCR removed' });
  } else {
    res.status(404);
    throw new Error('NCR not found');
  }
});

module.exports = {
  createNCR,
  getNCRs,
  getNCRById,
  updateNCR,
  deleteNCR,
};
