import React, { useEffect, useState } from 'react';
import axios from 'axios';

const DocumentComponent = () => {
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    const fetchDocuments = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get('http://localhost:5001/api/documents', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setDocuments(response.data);
      } catch (error) {
        console.error("Error fetching documents");
      }
    };

    fetchDocuments();
  }, []);

  return (
    <div>
      <h1>Documents</h1>
      <ul>
        {documents.map((document) => (
          <li key={document._id}>
            {document.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DocumentComponent;
