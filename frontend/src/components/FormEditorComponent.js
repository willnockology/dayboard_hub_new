import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FormEditorComponent.css';

const FormEditorComponent = () => {
  const [subcategories, setSubcategories] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [formFields, setFormFields] = useState([]);
  const [vesselParams, setVesselParams] = useState({
    flagStates: [],
    typeOfRegistrations: [],
    typeOfVessels: [],
  });
  const [selectedParams, setSelectedParams] = useState({
    flagStates: [],
    typeOfRegistrations: [],
    typeOfVessels: [],
  });
  const [applicabilityRange, setApplicabilityRange] = useState({
    min: ['no min'],
    max: ['no max'],
  });
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [errors, setErrors] = useState({});

  const applicabilityOptions = [
    'no min', '15+ Persons', '16+ persons', '24 meters', '80 GT', '100 GT', '300 GT', '400 GT', '500 GT', '1000 GT'
  ];

  useEffect(() => {
    if (!isAddingNew) {
      fetchSubcategories();
      fetchVesselParams();
    }
  }, [isAddingNew]);

  const fetchVesselParams = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('http://localhost:5001/api/vessels/params', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setVesselParams(response.data);
      setSelectedParams({
        flagStates: response.data.flagStates,
        typeOfRegistrations: response.data.typeOfRegistrations,
        typeOfVessels: response.data.typeOfVessels,
      });
    } catch (error) {
      console.error('Error fetching vessel parameters:', error);
    }
  };

  const fetchSubcategories = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('http://localhost:5001/api/forms/definitions', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const subcategories = [...new Set(response.data.map(form => form.subcategory))];
      setSubcategories(subcategories);
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
    }
  };

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setSelectedCategory(category);
    setSelectedSubcategory('');
    setSelectedItem(null);
    setFormFields([]);
  };

  const handleSubcategoryChange = (e) => {
    const subcategory = e.target.value;
    setSelectedSubcategory(subcategory);
    setSelectedItem(null);
    setFormFields([]);
    fetchItems(subcategory);
  };

  const fetchItems = (subcategory) => {
    const filteredItems = items.filter(item => item.subcategory === subcategory);
    setItems(filteredItems);
  };

  const handleItemChange = (e) => {
    const itemId = e.target.value;
    if (itemId === 'new') {
      setIsAddingNew(true);
      setFormFields([]);
    } else {
      const item = items.find(i => i._id === itemId);
      setSelectedItem(item);
      if (item && item._id) {
        fetchFormFields(item._id);
      }
    }
  };

  const fetchFormFields = async (itemId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`http://localhost:5001/api/forms/definitions/${itemId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const fields = response.data.fields.map(field => ({
        field_name: field.field_name || '',
        field_description: field.field_description || '', // Changed from field_title to field_description
        field_type: field.field_type || 'text',
        options: ['dropdown', 'radio'].includes(field.field_type) ? field.options || [] : undefined,
      }));

      setFormFields(fields);
    } catch (error) {
      console.error('Error fetching form fields:', error);
    }
  };

  const handleFieldChange = (index, field, value) => {
    const updatedFields = [...formFields];
    updatedFields[index][field] = value;
    setFormFields(updatedFields);
  };

  const handleAddField = () => {
    setFormFields([...formFields, { field_name: '', field_description: '', field_type: 'text', options: [] }]);
  };

  const handleDeleteField = (index) => {
    const updatedFields = formFields.filter((_, i) => i !== index);
    setFormFields(updatedFields);
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = {};

    if (!newItemName && (!selectedItem || selectedItem === 'new')) {
      newErrors.form_name = 'Form name is required';
      valid = false;
    }

    formFields.forEach((field, index) => {
      if (!field.field_name) {
        newErrors[`field_name_${index}`] = 'Field name is required';
        valid = false;
      }
    });

    setErrors(newErrors);
    return valid;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      console.error('Validation failed');
      return;
    }

    try {
      const updatedFields = formFields.map(field => ({
        field_name: field.field_name || '',
        field_description: field.field_description || '', // Changed from field_title to field_description
        field_type: field.field_type || 'text',
        options: ['dropdown', 'radio'].includes(field.field_type) ? field.options || [] : undefined,
      }));

      const min = applicabilityRange.min.includes('no min') ? null : applicabilityRange.min;
      const max = applicabilityRange.max.includes('no max') ? null : applicabilityRange.max;

      const payload = {
        form_name: selectedItem && selectedItem !== 'new' ? selectedItem.form_name : newItemName,
        fields: updatedFields,
        subcategory: selectedSubcategory,
        gross_tonnage_min: min,
        gross_tonnage_max: max,
        flagStates: selectedParams.flagStates,
        typeOfRegistrations: selectedParams.typeOfRegistrations,
        typeOfVessels: selectedParams.typeOfVessels,
      };

      const token = localStorage.getItem('authToken');

      if (selectedItem && selectedItem !== 'new' && selectedItem._id) {
        await axios.put(`http://localhost:5001/api/forms/definitions/${selectedItem._id}`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } else {
        await axios.post('http://localhost:5001/api/forms/definitions', payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      fetchSubcategories();
      setIsAddingNew(false);
      console.log('Form saved successfully');
    } catch (error) {
      console.error('Error saving form:', error);
      if (error.response && error.response.data) {
        console.error('Server Response:', error.response.data);
      }
    }
  };

  const handleMoveField = (index, direction) => {
    const updatedFields = [...formFields];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= updatedFields.length) return;

    const temp = updatedFields[targetIndex];
    updatedFields[targetIndex] = updatedFields[index];
    updatedFields[index] = temp;

    setFormFields(updatedFields);
  };

  const handleParamChange = (type, value, checked) => {
    setSelectedParams(prev => ({
      ...prev,
      [type]: checked
        ? [...prev[type], value]
        : prev[type].filter(item => item !== value),
    }));
  };

  const handleApplicabilityChange = (type, value, checked) => {
    setApplicabilityRange(prev => ({
      ...prev,
      [type]: checked
        ? [...prev[type], value]
        : prev[type].filter(item => item !== value),
    }));
  };

  const staticSubcategories = {
    'Form or Checklist': ['SMS', 'Contingency Plan', 'Security', 'Crew', 'Permits to Work'],
    Document: ['Flag', 'Class', 'Crew', 'Statutory', 'Insurance'],
  };

  return (
    <div className="form-editor-container">
      <h1>Edit Form</h1>
      {!isAddingNew && (
        <div className="form-editor-controls">
          <select value={selectedCategory} onChange={handleCategoryChange}>
            <option value="">Select Category</option>
            <option value="Form or Checklist">Form or Checklist</option>
            <option value="Document">Document</option>
          </select>
          {selectedCategory && (
            <select value={selectedSubcategory} onChange={handleSubcategoryChange}>
              <option value="">Select Subcategory</option>
              {subcategories.map(subcategory => (
                <option key={subcategory} value={subcategory}>{subcategory}</option>
              ))}
            </select>
          )}
          {selectedSubcategory && (
            <select value={selectedItem ? selectedItem._id : ''} onChange={handleItemChange}>
              <option value="">Select Item</option>
              {items.map(item => (
                <option key={item._id} value={item._id}>{item.form_name}</option>
              ))}
              <option value="new">Add New</option>
            </select>
          )}
          <button onClick={() => setIsAddingNew(true)}>Add New</button>
        </div>
      )}
      {isAddingNew && (
        <div className="new-item-form">
          <div className="form-editor-controls">
            <select value={selectedCategory} onChange={handleCategoryChange}>
              <option value="">Select Category</option>
              <option value="Form or Checklist">Form or Checklist</option>
              <option value="Document">Document</option>
            </select>
            {selectedCategory && (
              <select value={selectedSubcategory} onChange={handleSubcategoryChange}>
                <option value="">Select Subcategory</option>
                {staticSubcategories[selectedCategory].map(subcategory => (
                  <option key={subcategory} value={subcategory}>{subcategory}</option>
                ))}
              </select>
            )}
            <input
              type="text"
              placeholder="Enter item name"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
            />
            {errors.form_name && <p className="error">{errors.form_name}</p>}
            <div>
              <label>Minimum Applicability:</label>
              {applicabilityOptions.map(option => (
                <label key={option}>
                  <input
                    type="checkbox"
                    checked={applicabilityRange.min.includes(option)}
                    onChange={(e) => handleApplicabilityChange('min', option, e.target.checked)}
                  />
                  {option}
                </label>
              ))}
            </div>
            <div>
              <label>Maximum Applicability:</label>
              {['no max', '500 GT'].map(option => (
                <label key={option}>
                  <input
                    type="checkbox"
                    checked={applicabilityRange.max.includes(option)}
                    onChange={(e) => handleApplicabilityChange('max', option, e.target.checked)}
                  />
                  {option}
                </label>
              ))}
            </div>
            <div>
              <h3>Flag States</h3>
              {vesselParams.flagStates.map(flag => (
                <label key={flag}>
                  <input
                    type="checkbox"
                    checked={selectedParams.flagStates.includes(flag)}
                    onChange={(e) => handleParamChange('flagStates', flag, e.target.checked)}
                  />
                  {flag}
                </label>
              ))}
            </div>
            <div>
              <h3>Type of Registrations</h3>
              {vesselParams.typeOfRegistrations.map(type => (
                <label key={type}>
                  <input
                    type="checkbox"
                    checked={selectedParams.typeOfRegistrations.includes(type)}
                    onChange={(e) => handleParamChange('typeOfRegistrations', type, e.target.checked)}
                  />
                  {type}
                </label>
              ))}
            </div>
            <div>
              <h3>Type of Vessels</h3>
              {vesselParams.typeOfVessels.map(type => (
                <label key={type}>
                  <input
                    type="checkbox"
                    checked={selectedParams.typeOfVessels.includes(type)}
                    onChange={(e) => handleParamChange('typeOfVessels', type, e.target.checked)}
                  />
                  {type}
                </label>
              ))}
            </div>
            <div className="form-fields">
              {formFields.map((field, index) => (
                <div key={index} className="form-field">
                  <div className="field-row">
                    <div className="field-column">
                      <label>Field Name</label>
                      <input
                        type="text"
                        value={field.field_name}
                        onChange={(e) => handleFieldChange(index, 'field_name', e.target.value)}
                        placeholder="Field Name"
                      />
                      {errors[`field_name_${index}`] && <p className="error">{errors[`field_name_${index}`]}</p>}
                    </div>
                    <div className="field-column">
                      <label>Field Description</label>
                      <input
                        type="text"
                        value={field.field_description} // Changed from field_title to field_description
                        onChange={(e) => handleFieldChange(index, 'field_description', e.target.value)} // Changed from field_title to field_description
                        placeholder="Field Description"
                      />
                    </div>
                    <div className="field-column">
                      <label>Field Type</label>
                      <select
                        value={field.field_type}
                        onChange={(e) => handleFieldChange(index, 'field_type', e.target.value)}
                      >
                        <option value="text">Text</option>
                        <option value="dropdown">Dropdown</option>
                        <option value="date">Date</option>
                        <option value="checkbox">Checkbox</option>
                        <option value="paragraph">Paragraph</option>
                        <option value="radio">Radio</option>
                        <option value="image">Image</option>
                        <option value="file">File</option>
                        <option value="richText">Rich Text</option>
                        <option value="rating">Rating</option>
                        <option value="number">Number</option>
                        <option value="slider">Slider</option>
                        <option value="time">Time</option>
                        <option value="toggle">Toggle</option>
                      </select>
                    </div>
                  </div>
                  {['dropdown', 'radio'].includes(field.field_type) && (
                    <textarea
                      value={field.options ? field.options.join('\n') : ''}
                      onChange={(e) => handleFieldChange(index, 'options', e.target.value.split('\n'))}
                      placeholder="Dropdown or radio options (one per line)"
                    ></textarea>
                  )}
                  <div className="button-row">
                    <button onClick={() => handleMoveField(index, 'up')} className="move-up"></button>
                    <button onClick={() => handleMoveField(index, 'down')} className="move-down"></button>
                    <button onClick={() => handleDeleteField(index)}>Delete</button>
                  </div>
                </div>
              ))}
              <button onClick={handleAddField}>Add Field</button>
            </div>
          </div>
          <button onClick={handleSave}>Save</button>
          <button onClick={() => setIsAddingNew(false)}>Cancel</button>
        </div>
      )}
      {selectedItem && selectedItem !== 'new' && (
        <div className="form-fields">
          {formFields.map((field, index) => (
            <div key={index} className="form-field">
              <div className="field-row">
                <div className="field-column">
                  <label>Field Name</label>
                  <input
                    type="text"
                    value={field.field_name}
                    onChange={(e) => handleFieldChange(index, 'field_name', e.target.value)}
                    placeholder="Field Name"
                  />
                  {errors[`field_name_${index}`] && <p className="error">{errors[`field_name_${index}`]}</p>}
                </div>
                <div className="field-column">
                  <label>Field Description</label>
                  <input
                    type="text"
                    value={field.field_description} // Changed from field_title to field_description
                    onChange={(e) => handleFieldChange(index, 'field_description', e.target.value)} // Changed from field_title to field_description
                    placeholder="Field Description"
                  />
                </div>
                <div className="field-column">
                  <label>Field Type</label>
                  <select
                    value={field.field_type}
                    onChange={(e) => handleFieldChange(index, 'field_type', e.target.value)}
                  >
                    <option value="text">Text</option>
                    <option value="dropdown">Dropdown</option>
                    <option value="date">Date</option>
                    <option value="checkbox">Checkbox</option>
                    <option value="paragraph">Paragraph</option>
                    <option value="radio">Radio</option>
                    <option value="image">Image</option>
                    <option value="file">File</option>
                    <option value="richText">Rich Text</option>
                    <option value="rating">Rating</option>
                    <option value="number">Number</option>
                    <option value="slider">Slider</option>
                    <option value="time">Time</option>
                    <option value="toggle">Toggle</option>
                  </select>
                </div>
              </div>
              {['dropdown', 'radio'].includes(field.field_type) && (
                <textarea
                  value={field.options ? field.options.join('\n') : ''}
                  onChange={(e) => handleFieldChange(index, 'options', e.target.value.split('\n'))}
                  placeholder="Dropdown or radio options (one per line)"
                ></textarea>
              )}
              <div className="button-row">
                <button onClick={() => handleMoveField(index, 'up')} className="move-up"></button>
                <button onClick={() => handleMoveField(index, 'down')} className="move-down"></button>
                <button onClick={() => handleDeleteField(index)}>Delete</button>
              </div>
            </div>
          ))}
          <button onClick={handleAddField}>Add Field</button>
          <button onClick={handleSave}>Save</button>
        </div>
      )}
    </div>
  );
};

export default FormEditorComponent;
