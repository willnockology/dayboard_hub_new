import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useHistory } from 'react-router-dom';

const DynamicFormComponent = () => {
  const { id: formId } = useParams();  // Get formId from URL params
  const history = useHistory();
  const [formDefinition, setFormDefinition] = useState(null);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState('');
  const [submissionError, setSubmissionError] = useState('');
  const [validationErrors, setValidationErrors] = useState([]);

  useEffect(() => {
    const fetchFormDefinition = async () => {
      try {
        const token = localStorage.getItem('authToken');
        console.log(`Fetching form definition for formId: ${formId}`);
        const response = await axios.get(`http://localhost:5001/api/forms/definitions/${formId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log('Fetched formDefinition:', response.data);
        setFormDefinition(response.data);
      } catch (error) {
        console.error('Error fetching form definition:', error);
        setError('Error fetching form definition');
      }
    };

    fetchFormDefinition();
  }, [formId]);

  if (error) {
    console.log('Error:', error);
    return <div>{error}</div>;
  }

  if (!formDefinition) {
    console.log('Form definition not yet loaded.');
    return <div>Loading...</div>;
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    console.log(`Input change detected: ${name} = ${type === 'checkbox' ? checked : value}`);
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
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
    console.log('Validation errors:', errors);
    return errors.length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmissionError('');
    setValidationErrors([]);
    console.log('Form data on submit:', formData);

    if (!validateForm()) {
      console.log('Form validation failed.');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const userJson = localStorage.getItem('user');

      if (!userJson) {
        setSubmissionError('User information is missing. Please login again.');
        console.error('User information missing in local storage.');
        return;
      }

      const user = JSON.parse(userJson);

      if (!user || !user.firstName) {
        setSubmissionError('User information is missing. Please login again.');
        console.error('User information is invalid.');
        return;
      }

      const submissionData = {
        formId: formDefinition._id,
        fields: formData,
        completedBy: `${user.firstName} ${user.lastName}`,
        completedAt: new Date().toISOString(),
      };

      console.log('Submitting form data:', submissionData);

      const response = await axios.post('http://localhost:5001/api/forms/data', submissionData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Submission response:', response.data);

      // Show success popup
      alert('Form submitted successfully');
      
      // Update items in the dashboard after successful form submission
      history.push('/dashboard');
      window.location.reload();  // Reload the page to fetch the updated items
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmissionError('Error submitting form: ' + error.message);
    }
  };

  return (
    <div>
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
            {field.field_type === 'signature' && (
              <input
                type="text"
                name={field.field_name}
                value={formData[field.field_name] || ''}
                onChange={handleInputChange}
              />
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
      </form>
    </div>
  );
};

export default DynamicFormComponent;
