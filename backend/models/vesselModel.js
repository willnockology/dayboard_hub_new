const mongoose = require('mongoose');

const vesselSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  imoNumber: {
    type: String,
    required: true,
    unique: true
  },
  flagState: {
    type: String,
    required: true,
    enum: ['Cayman Islands', 'Jamaica', 'St Vincent', 'Marshall Islands', 'Bahamas']
  },
  grossTonnage: {
    type: Number,
    required: true
  },
  regulatoryLength: {
    type: Number,
    required: true
  },
  typeOfRegistration: {
    type: String,
    required: true,
    enum: ['PY', 'PYLC', 'CY']
  }
});

const Vessel = mongoose.model('Vessel', vesselSchema);

module.exports = Vessel;
