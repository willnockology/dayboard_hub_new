import React, { useState } from 'react';
import axios from 'axios';

const AddDocumentComponent = () => {
  const [name, setName] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      await axios.post(
        'http://localhost:5001/api/documents',
        { name, content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setName('');
      setContent('');
    } catch (error) {
      console.error("Error adding document");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <textarea
        placeholder="Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <button type="submit">Add Document</button>
    </form>
  );
};

export default AddDocumentComponent;
