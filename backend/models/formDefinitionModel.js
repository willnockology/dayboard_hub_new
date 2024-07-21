const mongoose = require('mongoose');

const formFieldSchema = mongoose.Schema({
  field_name: { type: String, required: true },
  field_title: { type: String, required: true },
  field_type: { type: String, required: true },
  options: [String], // For dropdowns
});

const formDefinitionSchema = mongoose.Schema({
  form_name: { type: String, required: true },
  fields: [formFieldSchema],
  gross_tonnage_min: { type: Number, required: false },
  gross_tonnage_max: { type: Number, required: false },
  subcategory: { type: String, required: true },
}, {
  timestamps: true,
});

const FormDefinition = mongoose.model('FormDefinition', formDefinitionSchema);

module.exports = FormDefinition;
