import React from 'react';
import axios from 'axios';

const DeleteDocumentComponent = ({ documentId }) => {
  const handleDelete = async () => {
    const token = localStorage.getItem('token');

    try {
      await axios.delete(`http://localhost:5001/api/documents/${documentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error("Error deleting document");
    }
  };

  return <button onClick={handleDelete}>Delete Document</button>;
};

export default DeleteDocumentComponent;
