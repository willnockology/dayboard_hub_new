const Chat = require('../models/chatModel');

exports.createChat = async (req, res) => {
  const { documentId, userId, message } = req.body;

  try {
    const chat = await Chat.create({ documentId, userId, message });
    res.status(201).json(chat);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getChats = async (req, res) => {
  const { documentId } = req.params;

  try {
    const chats = await Chat.find({ documentId }).populate('userId', 'username');
    res.json(chats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
