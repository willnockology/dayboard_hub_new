const mongoose = require('mongoose');

const formFieldSchema = mongoose.Schema({
  field_name: { type: String, required: true },
  field_description: { type: String, required: false },
  field_type: { type: String, required: true },
  options: [String],
  required: { type: Boolean, default: false }
});

const formDefinitionSchema = mongoose.Schema({
  form_name: { type: String, required: true },
  category: { type: String, required: true },
  subcategory: { type: String, required: true },
  fields: [formFieldSchema],
  applicableVesselTypes: { type: [String], default: [] },
  applicableFlagStates: { type: [String], default: [] },
  applicableRegistrations: { type: [String], default: [] },
  gross_tonnage_min: { type: Number, required: false, default: null },
  gross_tonnage_max: { type: Number, required: false, default: null },
  length_min: { type: Number, required: false, default: null },
  length_max: { type: Number, required: false, default: null },
  hiddenVessels: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Vessel', default: [] }]
}, {
  timestamps: true,
});

const FormDefinition = mongoose.model('FormDefinition', formDefinitionSchema);

module.exports = FormDefinition;
