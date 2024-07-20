const mongoose = require('mongoose');

const vesselSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  imoNumber: {
    type: String,
    required: true,
    unique: true,
  },
  flagState: {
    type: String,
    required: true,
    enum: ['Cayman Islands', 'Jamaica', 'St Vincent', 'Marshall Islands', 'Bahamas'],
  },
  grossTonnage: {
    type: Number,
    required: true,
  },
  regulatoryLength: {
    type: Number,
    required: true,
  },
  typeOfRegistration: {
    type: String,
    required: true,
    enum: ['PY', 'PYLC', 'CY'],
  },
  typeOfVessel: {
    type: String,
    required: true,
    enum: ['Container Ship', 'Yacht', 'Bulk Carrier', 'Chemical Carrier', 'Product Carrier', 'Crude Oil Carrier', 'LNG'],
  },
  callSign: {
    type: String,
    required: true,
  },
  portOfRegistry: {
    type: String,
    required: true,
  },
});

const Vessel = mongoose.model('Vessel', vesselSchema);

module.exports = Vessel;
