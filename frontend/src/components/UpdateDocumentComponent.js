import React, { useState } from 'react';
import axios from 'axios';

const UpdateDocumentComponent = ({ document }) => {
  const [name, setName] = useState(document.name);
  const [content, setContent] = useState(document.content);

  const handleUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      await axios.put(
        `http://localhost:5001/api/documents/${document._id}`,
        { name, content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error("Error updating document");
    }
  };

  return (
    <form onSubmit={handleUpdate}>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <button type="submit">Update Document</button>
    </form>
  );
};

export default UpdateDocumentComponent;
