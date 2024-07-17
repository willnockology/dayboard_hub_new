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

const createChat = [
  upload.single('attachment'), // Middleware to handle file upload
  async (req, res) => {
    const { documentId, message } = req.body;
    const userId = req.user._id; // Get userId from the authenticated user
    const attachment = req.file ? req.file.filename : null;

    if (!documentId || !message) {
      return res.status(400).json({ message: 'Document ID and message are required' });
    }

    try {
      let chat = await Chat.create({ documentId, userId, message, attachment, readBy: [userId] });
      chat = await chat.populate('userId', 'firstName lastName').execPopulate();
      res.status(201).json(chat);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
];

const getChats = async (req, res) => {
  const { documentId } = req.params;

  try {
    const chats = await Chat.find({ documentId }).populate('userId', 'firstName lastName');
    res.json(chats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const markAsRead = async (req, res) => {
  const { documentId } = req.body;
  const userId = req.user._id; // Get userId from the authenticated user

  try {
    // First, mark chats as read
    const result = await Chat.updateMany(
      { documentId, readBy: { $ne: userId } },
      { $push: { readBy: userId } }
    );

    // Second, add readBy array to documents that don't have it
    const addReadByArrayResult = await Chat.updateMany(
      { documentId, readBy: { $exists: false } },
      { $set: { readBy: [userId] } }
    );

    res.status(200).json({ 
      message: 'Chats marked as read', 
      result,
      addReadByArrayResult
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAllChats = async (req, res) => {
  try {
    const chats = await Chat.find().populate('userId', 'firstName lastName');
    res.json(chats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAllUnreadComments = async (req, res) => {
  const userId = req.user._id;

  try {
    const unreadChats = await Chat.find({ readBy: { $ne: userId } }).populate('userId', 'firstName lastName');
    res.json(unreadChats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Export the functions
module.exports = {
  createChat,
  getChats,
  markAsRead,
  getAllChats,
  getAllUnreadComments,
};
