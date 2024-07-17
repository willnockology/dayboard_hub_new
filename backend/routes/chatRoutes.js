const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  createChat,
  getChats,
  markAsRead,
  getAllChats,
  getAllUnreadComments
} = require('../controllers/chatController');

const router = express.Router();

// Static routes first
router.route('/allUnreadComments').get(protect, getAllUnreadComments);
router.route('/all').get(protect, getAllChats);
router.route('/markAsRead').post(protect, markAsRead);

// Dynamic routes last
router.route('/:documentId').get(protect, getChats);
router.route('/').post(protect, createChat);

module.exports = router;
