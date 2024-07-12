const mongoose = require('mongoose');

const formDataSchema = mongoose.Schema(
  {
    formId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'FormDefinition',
    },
    fields: {
      type: Map,
      of: String,
      required: true,
    },
    signature: {
      type: String,
      required: false,
    },
    completedBy: {
      type: String,
      required: true,
    },
    completedAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const FormData = mongoose.model('FormData', formDataSchema);

module.exports = FormData;
