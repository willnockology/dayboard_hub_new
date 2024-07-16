const Chat = require('../models/chatModel');
const multer = require('multer');
const path = require('path');

// Set up multer for file handling
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

exports.createChat = [
  upload.single('attachment'), // Middleware to handle file upload
  async (req, res) => {
    const { documentId, userId, message } = req.body;
    const attachment = req.file ? req.file.filename : null;

    console.log('Incoming chat request:', req.body);

    if (!documentId || !userId || !message) {
      console.log('Bad Request: Missing fields');
      return res.status(400).json({ message: 'All fields are required' });
    }

    try {
      let chat = await Chat.create({ documentId, userId, message, attachment });
      chat = await chat.populate('userId', 'firstName lastName').execPopulate();
      console.log('Chat created with populated user info:', chat);
      res.status(201).json(chat);
    } catch (err) {
      console.error('Error creating chat:', err.message);
      res.status(400).json({ message: err.message });
    }
  }
];

exports.getChats = async (req, res) => {
  const { documentId } = req.params;

  try {
    const chats = await Chat.find({ documentId }).populate('userId', 'firstName lastName');
    res.json(chats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
