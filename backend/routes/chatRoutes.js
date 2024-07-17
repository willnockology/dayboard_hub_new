const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { createChat, getChats, markAsRead } = require('../controllers/chatController');
const router = express.Router();

router.post('/', protect, createChat);
router.get('/:documentId', protect, getChats);
router.post('/markAsRead', protect, markAsRead);

module.exports = router;
