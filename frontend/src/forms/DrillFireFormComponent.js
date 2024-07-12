import React, { useState } from 'react';
import axios from 'axios';
import '../global.css';
import './forms.css';
import SignatureComponent from '../components/SignatureComponent';

const DrillFireFormComponent = ({ match }) => {
  const [formData, setFormData] = useState({
    dateOfDrill: '',
    type: '',
    details: '',
    improvements: '',
    signature: '',
  });
  const [signatureData, setSignatureData] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('authToken');
      const completedBy = localStorage.getItem('userId');
      const completedAt = new Date().toISOString();

      const response = await axios.post(
        'http://localhost:5001/api/forms/submit',
        {
          formId: match.params.id,
          fields: formData,
          signature: signatureData,
          completedBy,
          completedAt,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('Response from server:', response.data);
      setMessage('Form has been successfully submitted! Please close the tab and refresh the Dashboard to view.');
    } catch (error) {
      console.error('Error submitting form:', error.response ? error.response.data : error.message);
      setError('Error submitting form');
    }
  };

  return (
    <div className="form-container">
      <h2>Drill - Fire Form</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {!message && (
        <form onSubmit={handleSubmit}>
          <label>
            Date of Drill:
            <input type="date" name="dateOfDrill" value={formData.dateOfDrill} onChange={handleChange} required />
          </label>
          <label>
            Type:
            <select name="type" value={formData.type} onChange={handleChange} required>
              <option value="">Select Type</option>
              <option value="Exercise">Exercise</option>
              <option value="Training">Training</option>
            </select>
          </label>
          <label>
            Details of Drill:
            <textarea name="details" value={formData.details} onChange={handleChange} required />
          </label>
          <label>
            Areas for Improvement:
            <textarea name="improvements" value={formData.improvements} onChange={handleChange} required />
          </label>
          <label>
            Signature:
            <SignatureComponent signatureData={signatureData} setSignatureData={setSignatureData} />
          </label>
          <button type="submit">Submit</button>
        </form>
      )}
    </div>
  );
};

export default DrillFireFormComponent;
