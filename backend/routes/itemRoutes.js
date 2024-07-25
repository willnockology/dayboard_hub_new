const express = require('express');
const { getItems, createItem, deleteItem } = require('../controllers/itemController');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

router.route('/')
  .get(protect, getItems)  // Use getItems here
  .post(protect, upload.array('attachments'), createItem);

router.route('/:id')
  .delete(protect, deleteItem);

module.exports = router;
