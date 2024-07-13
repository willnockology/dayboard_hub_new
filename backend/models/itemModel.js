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
  vessel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vessel',
    required: true
  }
}, {
  timestamps: true
});

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;
