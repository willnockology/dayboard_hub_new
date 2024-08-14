const asyncHandler = require('express-async-handler');
const NonConformityReport = require('../models/ncrModel');
const Vessel = require('../models/vesselModel');

// @desc    Create a new NCR
// @route   POST /api/ncrs
// @access  Private
const createNCR = asyncHandler(async (req, res) => {
  const {
    vessel,
    date,
    title,
    deficiencyType,
    attachments,
    proposedCorrectiveAction,
    deficiencyIdentifiedBy,
    otherDeficiencyIdentifier,
    deficiencyRelatedTo,
    deficiencyRelatedSection,
    companySection,
    companySectionReference,
    flagNotified = false,  // Default value
    classNotified = false,  // Default value
    dpaComments,
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

  // Find the last NCR for this vessel to generate the next report number
  const lastNCR = await NonConformityReport.findOne({ vessel })
    .sort({ reportNumber: -1 });

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
    title,
    deficiencyType,
    attachments,
    proposedCorrectiveAction,
    deficiencyIdentifiedBy,
    otherDeficiencyIdentifier: deficiencyIdentifiedBy === 'Other' ? otherDeficiencyIdentifier : undefined,
    deficiencyRelatedTo,
    deficiencyRelatedSection,
    companySection,
    companySectionReference,
    flagNotified,
    classNotified,
    dpaComments,
    reportedBy,
    description,
    rootCause,
    correctiveAction,
    status: correctiveAction ? 'Pending DPA Sign Off' : 'Open',
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
    title,
    deficiencyType,
    attachments,
    proposedCorrectiveAction,
    deficiencyIdentifiedBy,
    otherDeficiencyIdentifier,
    deficiencyRelatedTo,
    deficiencyRelatedSection,
    companySection,
    companySectionReference,
    flagNotified,
    classNotified,
    dpaComments,
    description,
    rootCause,
    correctiveAction,
    dueDate,
    closedDate,
  } = req.body;

  const ncr = await NonConformityReport.findById(req.params.id);

  if (ncr) {
    ncr.date = date || ncr.date;
    ncr.title = title || ncr.title;
    ncr.deficiencyType = deficiencyType || ncr.deficiencyType;
    ncr.attachments = attachments || ncr.attachments;
    ncr.proposedCorrectiveAction = proposedCorrectiveAction || ncr.proposedCorrectiveAction;
    ncr.deficiencyIdentifiedBy = deficiencyIdentifiedBy || ncr.deficiencyIdentifiedBy;
    ncr.otherDeficiencyIdentifier = deficiencyIdentifiedBy === 'Other' ? otherDeficiencyIdentifier : undefined;
    ncr.deficiencyRelatedTo = deficiencyRelatedTo || ncr.deficiencyRelatedTo;
    ncr.deficiencyRelatedSection = deficiencyRelatedSection || ncr.deficiencyRelatedSection;
    ncr.companySection = companySection || ncr.companySection;
    ncr.companySectionReference = companySectionReference || ncr.companySectionReference;
    ncr.flagNotified = flagNotified !== undefined ? flagNotified : ncr.flagNotified;
    ncr.classNotified = classNotified !== undefined ? classNotified : ncr.classNotified;
    ncr.dpaComments = dpaComments || ncr.dpaComments;
    ncr.description = description || ncr.description;
    ncr.rootCause = rootCause || ncr.rootCause;
    ncr.correctiveAction = correctiveAction || ncr.correctiveAction;
    ncr.status = correctiveAction ? 'Pending DPA Sign Off' : ncr.status;
    ncr.dueDate = dueDate || ncr.dueDate;
    ncr.closedDate = closedDate || ncr.closedDate;

    const updatedNCR = await ncr.save();
    res.json(updatedNCR);
  } else {
    res.status(404).throw(new Error('NCR not found'));
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
    res.status(404).throw(new Error('NCR not found'));
  }
});

module.exports = {
  createNCR,
  getNCRs,
  getNCRById,
  updateNCR,
  deleteNCR,
};
