import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './forms.css';
import '../global.css';
import MetadataComponent from '../components/MetadataComponent';
import SignatureComponent from '../components/SignatureComponent';

const ViewFormComponent = ({ match }) => {
  const [formData, setFormData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        console.log(`Fetching form data with ID: ${match.params.id}`);
        const token = localStorage.getItem('authToken');
        const response = await axios.get(`http://localhost:5001/api/forms/${match.params.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log('Form data fetched:', response.data);
        setFormData(response.data);
      } catch (error) {
        console.error('Error fetching form data:', error.response ? error.response.data : error.message);
        setError('Error fetching form data');
      }
    };

    fetchFormData();
  }, [match.params.id]);

  if (error) {
    return <div>{error}</div>;
  }

  if (!formData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="form-container">
      <h2>View Form</h2>
      <p><strong>Date of Drill:</strong> {formData.fields.dateOfDrill}</p>
      <p><strong>Type:</strong> {formData.fields.type}</p>
      <p><strong>Details of Drill:</strong> {formData.fields.details}</p>
      <p><strong>Areas for Improvement:</strong> {formData.fields.improvements}</p>
      <MetadataComponent completedBy={formData.completedBy} completedAt={formData.completedAt} />
      <SignatureComponent signatureData={formData.signature} />
    </div>
  );
};

export default ViewFormComponent;
