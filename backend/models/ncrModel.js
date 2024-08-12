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
  date: {
    type: Date,
    required: true,
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId, // Store ObjectId reference to the User model
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
    enum: ['Open', 'Pending DPA Sign Off', 'Closed'], // Ensure all status values are included
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
