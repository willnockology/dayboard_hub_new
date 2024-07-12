import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useHistory } from 'react-router-dom';

const DynamicFormComponent = () => {
  const { formType } = useParams();
  const history = useHistory();
  const [formDefinition, setFormDefinition] = useState(null);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState('');
  const [submissionError, setSubmissionError] = useState('');

  useEffect(() => {
    const fetchFormDefinition = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(`http://localhost:5001/api/forms/definitions/${formType}`, {
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
  }, [formType]);

  if (error) {
    return <div>{error}</div>;
  }

  if (!formDefinition) {
    return <div>Loading...</div>;
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmissionError('');
    try {
      const token = localStorage.getItem('authToken');
      const userJson = localStorage.getItem('user');

      console.log('User JSON from localStorage:', userJson);

      if (!userJson) {
        setSubmissionError('User information is missing. Please login again.');
        return;
      }

      let user;
      try {
        user = JSON.parse(userJson);
      } catch (parseError) {
        console.error('Error parsing user JSON:', parseError);
        setSubmissionError('Error parsing user information. Please login again.');
        return;
      }

      console.log('Parsed user object:', user);

      if (!user || !user.username) {
        setSubmissionError('User information is incomplete. Please login again.');
        return;
      }

      const submissionData = {
        formId: formDefinition._id,
        fields: formData,
        completedBy: `${user.firstName} ${user.lastName}`, // Use firstName and lastName for completion
        completedAt: new Date().toISOString(),
      };

      if (!submissionData.formId || !submissionData.fields || !submissionData.completedBy || !submissionData.completedAt) {
        setSubmissionError('One or more required fields are missing');
        return;
      }

      console.log('Submitting form data:', submissionData);

      const response = await axios.post('http://localhost:5001/api/forms/data', submissionData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Submission response:', response);
      alert('Form submitted successfully');
      history.push('/dashboard');
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
          <div key={field.field_name}>
            <label>{field.field_title}</label>
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
              <h2>{field.field_title}</h2>
            )}
          </div>
        ))}
        <button type="submit">Submit</button>
        {submissionError && <div style={{ color: 'red' }}>{submissionError}</div>}
      </form>
    </div>
  );
};

export default DynamicFormComponent;
