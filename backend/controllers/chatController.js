const Chat = require('../models/chatModel');

exports.createChat = async (req, res) => {
  const { documentId, userId, message } = req.body;

  console.log('Incoming chat request:', req.body);

  if (!documentId || !userId || !message) {
    console.log('Bad Request: Missing fields');
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    let chat = await Chat.create({ documentId, userId, message });
    chat = await chat.populate('userId', 'firstName lastName').execPopulate();
    console.log('Chat created with populated user info:', chat);
    res.status(201).json(chat);
  } catch (err) {
    console.error('Error creating chat:', err.message);
    res.status(400).json({ message: err.message });
  }
};

exports.getChats = async (req, res) => {
  const { documentId } = req.params;

  try {
    const chats = await Chat.find({ documentId }).populate('userId', 'firstName lastName');
    res.json(chats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
