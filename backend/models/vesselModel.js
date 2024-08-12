const mongoose = require('mongoose');

const vesselSchema = new mongoose.Schema({
  name: { type: String, required: true },
  imoNumber: { type: String, required: true, unique: true },
  flagState: {
    type: String,
    required: true,
    enum: ['Cayman Islands', 'Jamaica', 'St Vincent', 'Marshall Islands', 'Bahamas'],
  },
  grossTonnage: { type: Number, required: true },
  regulatoryLength: { type: Number, required: true },
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
  callSign: { type: String, required: true },
  portOfRegistry: { type: String, required: true },
  numberOfPeople: { type: Number, required: true },
  builder: { type: String },
  model: { type: String },
  hullId: { type: String },
  officialNumber: { type: String },
  mmsiNumber: { type: String },
  loa: { type: Number }, // Length Overall in meters
  netTonnage: { type: Number },
  beam: { type: Number },
  depth: { type: Number },
  waterCapacity: { type: Number }, // in liters
  fuelCapacity: { type: Number }, // in liters
  cruisingSpeed: { type: Number }, // in knots
  maxSpeed: { type: Number }, // in knots
  cruisingRange: { type: Number }, // in nautical miles
  cruisingArea: {
    type: String,
    enum: ['USA', 'Bahamas', 'Caribbean', 'Mediterranean', 'Canada', 'South Pacific'],
  },
  usDutyPaid: { type: Boolean },
  vatPaid: { type: Boolean },
  mainEngineModel: { type: String },
  mainEngineKw: { type: Number }, // in kilowatts
  numberOfMainEngines: { type: Number },
  ecdis: { type: Boolean }, // Electronic Chart Display and Information System
  ballastTanks: { type: Boolean },
  hullMaterial: { type: String },
  superstructureMaterial: { type: String },
  helicopter: { type: Boolean },
  submersible: { type: Boolean },
});

const Vessel = mongoose.model('Vessel', vesselSchema);

module.exports = Vessel;
