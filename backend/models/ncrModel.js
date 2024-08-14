const mongoose = require('mongoose');

const nonConformityReportSchema = new mongoose.Schema({
  vessel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vessel',
    required: true,
  },
  reportNumber: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
    maxlength: 50,
  },
  deficiencyType: {
    type: String,
    enum: ['Deficiency', 'Observation', 'Non-Conformity', 'Major Non-Conformity'],
    required: true,
  },
  attachments: [
    {
      fileName: String,
      fileUrl: String,
    },
  ],
  proposedCorrectiveAction: {
    type: String,
  },
  deficiencyIdentifiedBy: {
    type: String,
    enum: ['Crew', 'Company', 'Class', 'Flag', 'Port State Control', 'Other'],
    required: true,
  },
  otherDeficiencyIdentifier: {
    type: String,
  },
  deficiencyRelatedTo: {
    type: String,
    enum: ['ISM', 'ISPS', 'MLC'],
  },
  deficiencyRelatedSection: {
    type: String,
  },
  companySection: {
    type: String,
    enum: ['SMS', 'SSP', 'DMLC/SEA'],
  },
  companySectionReference: {
    type: String,
  },
  flagNotified: {
    type: Boolean,
    default: false,
  },
  classNotified: {
    type: Boolean,
    default: false,
  },
  dpaComments: {
    type: String,
  },
  date: {
    type: Date,
    required: true,
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  rootCause: {
    type: String,
  },
  correctiveAction: {
    type: String,
  },
  status: {
    type: String,
    enum: ['Open', 'Pending DPA Sign Off', 'Closed'],
    default: 'Open',
  },
  dueDate: {
    type: Date,
  },
  closedDate: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Ensure that the combination of vessel and reportNumber is unique
nonConformityReportSchema.index({ vessel: 1, reportNumber: 1 }, { unique: true });

const NonConformityReport = mongoose.model('NonConformityReport', nonConformityReportSchema);

module.exports = NonConformityReport;
