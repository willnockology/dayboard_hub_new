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
  formDefinitionId: {  // Add this line
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FormDefinition',  // Assuming your form definitions are stored in a collection named 'FormDefinition'
    required: true  // Adjust this if you do not want it to be required
  }
}, {
  timestamps: true
});

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;
