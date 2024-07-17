const Chat = require('../models/chatModel');
const multer = require('multer');

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

    if (!documentId || !userId || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    try {
      let chat = await Chat.create({ documentId, userId, message, attachment });
      chat = await chat.populate('userId', 'firstName lastName').execPopulate();
      res.status(201).json(chat);
    } catch (err) {
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

exports.markAsRead = async (req, res) => {
  const { documentId, userId } = req.body;

  try {
    await Chat.updateMany(
      { documentId, readBy: { $ne: userId } },
      { $push: { readBy: userId } }
    );
    res.status(200).json({ message: 'Chats marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
