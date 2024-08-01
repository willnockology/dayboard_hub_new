const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  subcategory: {
    type: String,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  title: {
    type: String
  },
  details: {
    type: String
  },
  completed: {
    type: Boolean,
    default: false
  },
  attachments: [
    {
      type: String
    }
  ],
  pdfPath: {
    type: String
  },
  vessel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vessel',
    required: true
  },
  role: {
    type: String,
    required: true
  },
  formDefinitionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FormDefinition',
    required: true
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurrenceFrequency: {
    type: String,
    enum: ['week', 'month', 'year'],
    default: null // Ensure this is handled correctly in the controller
  },
  recurrenceInterval: {
    type: Number,
    default: null
  },
  recurrenceBasis: {
    type: String,
    enum: ['initial', 'completion'],
    default: 'initial'
  }
}, {
  timestamps: true
});

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;
