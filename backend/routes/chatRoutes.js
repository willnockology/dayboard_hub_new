const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const Chat = require('../models/chatModel'); // Correct path to Chat model
const router = express.Router();

// Add your chat-related routes here
router.get('/:documentId', protect, (req, res) => {
  // Fetch chat messages for the document and respond
});

module.exports = router;
