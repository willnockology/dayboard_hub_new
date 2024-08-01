const mongoose = require('mongoose');

const formDataSchema = mongoose.Schema(
  {
    formDefinitionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'FormDefinition',
    },
    fields: {
      type: Map,
      of: mongoose.Schema.Types.Mixed, // Allow mixed types to store dates as Date objects
      required: true,
    },
    images: [
      {
        url: String,
        _id: false,
      },
    ],
    completedBy: {
      type: String,
      required: true,
    },
    completedAt: {
      type: Date,
      required: true,
    },
    pdfPath: {
      type: String,
      required: false,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
    },
    location: {
      lat: {
        type: Number,
        required: true,
      },
      long: {
        type: Number,
        required: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

const FormData = mongoose.model('FormData', formDataSchema);

module.exports = FormData;
