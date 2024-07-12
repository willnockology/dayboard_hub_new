const asyncHandler = require('express-async-handler');
const Document = require('../models/documentModel');

const getDocuments = asyncHandler(async (req, res) => {
  const documents = await Document.find({});
  res.json(documents);
});

const createDocument = asyncHandler(async (req, res) => {
  const { name, content } = req.body;

  const document = new Document({
    name,
    content,
  });

  const createdDocument = await document.save();
  res.status(201).json(createdDocument);
});

const updateDocument = asyncHandler(async (req, res) => {
  const { name, content } = req.body;
  const document = await Document.findById(req.params.id);

  if (document) {
    document.name = name;
    document.content = content;

    const updatedDocument = await document.save();
    res.json(updatedDocument);
  } else {
    res.status(404);
    throw new Error('Document not found');
  }
});

const deleteDocument = asyncHandler(async (req, res) => {
  const document = await Document.findById(req.params.id);

  if (document) {
    await document.remove();
    res.json({ message: 'Document removed' });
  } else {
    res.status(404);
    throw new Error('Document not found');
  }
});

module.exports = {
  getDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
};
