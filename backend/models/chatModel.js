const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  attachment: {
    type: String,
  },
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: [],
  }],
}, {
  timestamps: true,
});

const Chat = mongoose.model('Chat', chatSchema);
module.exports = Chat;
