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
    default: undefined, // Use undefined instead of null
  },
  recurrenceInterval: {
    type: Number,
    default: undefined, // Use undefined instead of null
  },
  recurrenceBasis: {
    type: String,
    enum: ['initial', 'completion'],
    default: undefined, // Use undefined instead of null
  }
}, {
  timestamps: true
});

// Ensure that non-recurring items do not store recurrence data
itemSchema.pre('save', function (next) {
  if (!this.isRecurring) {
    this.recurrenceFrequency = undefined;
    this.recurrenceInterval = undefined;
    this.recurrenceBasis = undefined;
  }
  next();
});

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;
