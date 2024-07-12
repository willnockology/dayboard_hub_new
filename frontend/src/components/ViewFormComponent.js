import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const ViewFormComponent = () => {
  const { formType, id } = useParams();
  const [formDefinition, setFormDefinition] = useState(null);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFormDefinition = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(`http://localhost:5001/api/forms/definitions/${formType}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setFormDefinition(response.data);
      } catch (error) {
        console.error('Error fetching form definition:', error.response ? error.response.data : error.message);
        setError('Error fetching form definition');
      }
    };

    fetchFormDefinition();
  }, [formType]);

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(`http://localhost:5001/api/forms/data/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setFormData(response.data.fields);
      } catch (error) {
        console.error('Error fetching form data:', error.response ? error.response.data : error.message);
        setError('Error fetching form data');
      }
    };

    fetchFormData();
  }, [id]);

  if (error) {
    return <div>{error}</div>;
  }

  if (!formDefinition) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{formDefinition.form_name} (View Only)</h1>
      <form>
        {formDefinition.fields.map((field) => (
          <div key={field.field_name}>
            <label>{field.field_title}</label>
            <input
              type={field.field_type}
              name={field.field_name}
              value={formData[field.field_name] || ''}
              readOnly
            />
          </div>
        ))}
      </form>
    </div>
  );
};

export default ViewFormComponent;
