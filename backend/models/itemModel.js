const mongoose = require('mongoose');

const itemSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    subcategory: {
      type: String,
      required: true,
    },
    dueDate: {
      type: Date,
    },
    pdfPath: {
      type: String,  // Add this field
    },
    completed: {
      type: Boolean,
      default: false,
    },
    attachments: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;
