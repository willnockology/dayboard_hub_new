const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { createChat, getChats } = require('../controllers/chatController');
const router = express.Router();

router.post('/', protect, createChat);
router.get('/:documentId', protect, getChats);

module.exports = router;
