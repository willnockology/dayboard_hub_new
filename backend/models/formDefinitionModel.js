const mongoose = require('mongoose');

const formFieldSchema = mongoose.Schema({
  label: { type: String, required: true },
  type: { type: String, required: true },
  options: [String], // For dropdowns
});

const formDefinitionSchema = mongoose.Schema({
  formId: { type: String, required: true, unique: true },
  fields: [formFieldSchema],
}, {
  timestamps: true,
});

const FormDefinition = mongoose.model('FormDefinition', formDefinitionSchema);

module.exports = FormDefinition;
