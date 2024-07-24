const mongoose = require('mongoose');

const formFieldSchema = mongoose.Schema({
  field_name: { type: String, required: true },
  field_description: { type: String, required: false }, // Make field_description optional
  field_type: { type: String, required: true },
  options: [String], // For dropdowns
  required: { type: Boolean, default: false } // Ensure this is included for required fields
});

const formDefinitionSchema = mongoose.Schema({
  form_name: { type: String, required: true },
  category: { type: String, required: true },
  subcategory: { type: String, required: true },
  fields: [formFieldSchema],
  gross_tonnage_min: { type: Number, required: false },
  gross_tonnage_max: { type: Number, required: false },
}, {
  timestamps: true,
});

const FormDefinition = mongoose.model('FormDefinition', formDefinitionSchema);

module.exports = FormDefinition;
