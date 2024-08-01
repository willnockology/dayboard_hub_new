import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useHistory } from 'react-router-dom';
import './DynamicFormComponent.css';  // Import the CSS file

const DynamicFormComponent = () => {
  const { id: formId } = useParams();  // Get formId from URL params
  const history = useHistory();
  const [formDefinition, setFormDefinition] = useState(null);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState('');
  const [submissionError, setSubmissionError] = useState('');
  const [validationErrors, setValidationErrors] = useState([]);
  const [successMessage, setSuccessMessage] = useState(''); // New state for success message

  useEffect(() => {
    const fetchFormDefinition = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(`http://localhost:5001/api/forms/definitions/${formId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setFormDefinition(response.data);
      } catch (error) {
        setError('Error fetching form definition');
      }
    };

    fetchFormDefinition();
  }, [formId]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: files[0], // Assuming single file upload for now
    }));
  };

  const validateForm = () => {
    const errors = [];
    formDefinition.fields.forEach((field) => {
      if (field.required && !formData[field.field_name]) {
        errors.push(`${field.field_name} is required`);
      }
    });
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmissionError('');
    setValidationErrors([]);

    if (!validateForm()) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const userJson = localStorage.getItem('user');

      if (!userJson) {
        setSubmissionError('User information is missing. Please login again.');
        return;
      }

      const user = JSON.parse(userJson);
      const submissionData = new FormData();
      submissionData.append('formId', formDefinition._id);
      submissionData.append('completedBy', `${user.firstName} ${user.lastName}`);
      submissionData.append('completedAt', new Date().toISOString());

      // Append form data to the submission
      Object.keys(formData).forEach((key) => {
        submissionData.append(key, formData[key]);
      });

      await axios.post('http://localhost:5001/api/forms/data', submissionData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      // Show success message
      setSuccessMessage('Form submitted successfully');
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        history.push('/dashboard');
      }, 2000); // 2-second delay

    } catch (error) {
      setSubmissionError('Error submitting form: ' + error.message);
    }
  };

  if (error) {
    return <div>{error}</div>;
  }

  if (!formDefinition) {
    return <div>Loading...</div>;
  }

  return (
    <div id="dynamic-form-container">
      <h1>{formDefinition.form_name}</h1>
      <form onSubmit={handleSubmit}>
        {formDefinition.fields.map((field) => (
          <div key={field._id}>
            <label>{field.field_name}</label>
            {field.field_type === 'text' && (
              <input
                type="text"
                name={field.field_name}
                value={formData[field.field_name] || ''}
                onChange={handleInputChange}
              />
            )}
            {field.field_type === 'date' && (
              <input
                type="date"
                name={field.field_name}
                value={formData[field.field_name] || ''}
                onChange={handleInputChange}
              />
            )}
            {field.field_type === 'time' && (
              <input
                type="time"
                name={field.field_name}
                value={formData[field.field_name] || ''}
                onChange={handleInputChange}
              />
            )}
            {field.field_type === 'dropdown' && (
              <select
                name={field.field_name}
                value={formData[field.field_name] || ''}
                onChange={handleInputChange}
              >
                {field.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            )}
            {field.field_type === 'checkbox' && (
              <input
                type="checkbox"
                name={field.field_name}
                checked={formData[field.field_name] || false}
                onChange={handleInputChange}
              />
            )}
            {field.field_type === 'textarea' && (
              <textarea
                name={field.field_name}
                value={formData[field.field_name] || ''}
                onChange={handleInputChange}
              ></textarea>
            )}
            {field.field_type === 'image' && (
              <input
                type="file"
                name={field.field_name}
                accept="image/*"
                onChange={handleFileChange}
              />
            )}
            {field.field_type === 'paragraph' && (
              <textarea
                name={field.field_name}
                value={formData[field.field_name] || ''}
                onChange={handleInputChange}
                rows={5}
              ></textarea>
            )}
            {field.field_type === 'section' && (
              <h2>{field.field_name}</h2>
            )}
          </div>
        ))}
        <button type="submit">Submit</button>
        {validationErrors.length > 0 && (
          <div style={{ color: 'red' }}>
            <p>It looks like you've missed a few required fields. Here are the fields that need to be completed before you submit:</p>
            <ul>
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
        {submissionError && <div style={{ color: 'red' }}>{submissionError}</div>}
        {successMessage && <div style={{ color: 'green' }}>{successMessage}</div>}
      </form>
    </div>
  );
};

export default DynamicFormComponent;
