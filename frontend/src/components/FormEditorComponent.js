import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faEdit } from '@fortawesome/free-solid-svg-icons';
import './FormEditorComponent.css';

const FormEditorComponent = () => {
  const categories = [
    { id: 1, name: 'Form or Checklist' },
    { id: 2, name: 'Document' },
    { id: 3, name: 'Track a Date' },
    { id: 4, name: 'Crew' },
  ];

  const subCategories = [
    { id: 1, name: 'Crew', categoryId: 1 },
    { id: 2, name: 'Engineering', categoryId: 1 },
    { id: 3, name: 'Permits to Work', categoryId: 1 },
    { id: 4, name: 'Security', categoryId: 1 },
    { id: 5, name: 'SMS', categoryId: 1 },
    { id: 6, name: 'Class', categoryId: 2 },
    { id: 7, name: 'Crew', categoryId: 2 },
    { id: 8, name: 'Equipment', categoryId: 2 },
    { id: 9, name: 'Flag', categoryId: 2 },
    { id: 10, name: 'Insurance', categoryId: 2 },
    { id: 11, name: 'Plans & Manuals', categoryId: 2 },
    { id: 12, name: 'SOP', categoryId: 2 },
    { id: 13, name: 'Risk Assessment', categoryId: 2 },
    { id: 14, name: 'MSDS', categoryId: 2 },
    { id: 15, name: 'Standing Orders', categoryId: 2 },
    { id: 16, name: 'Statutory', categoryId: 2 },
    { id: 17, name: 'Certificate of Competency (CoC)', categoryId: 4 },
    { id: 18, name: 'Certificate of Endorsement (CoE)', categoryId: 4 },
    { id: 19, name: 'Global Maritime Distress and Safety System (GMDSS) Certificate', categoryId: 4 },
    { id: 20, name: 'Basic Safety Training (BST) Certificate', categoryId: 4 },
    { id: 21, name: 'Medical Certificate (ENG1 or Equivalent)', categoryId: 4 },
    { id: 22, name: 'Seafarer’s Identification and Record Book (SIRB) / Seaman’s Book', categoryId: 4 },
    { id: 23, name: 'Security Awareness Training Certificate', categoryId: 4 },
    { id: 24, name: 'Proficiency in Survival Craft and Rescue Boats (PSCRB)', categoryId: 4 },
    { id: 25, name: 'Advanced Firefighting Certificate', categoryId: 4 },
    { id: 26, name: 'Proficiency in Fast Rescue Boats Certificate', categoryId: 4 },
    { id: 27, name: 'Crowd Management Training Certificate', categoryId: 4 },
    { id: 28, name: 'Crisis Management and Human Behavior Training Certificate', categoryId: 4 },
    { id: 29, name: 'Dangerous Goods Training Certificate', categoryId: 4 },
    { id: 30, name: 'Ship Security Officer (SSO) Certificate', categoryId: 4 },
    { id: 31, name: 'Proficiency in Designated Security Duties (PDSD) Certificate', categoryId: 4 },
    { id: 32, name: 'Bridge Resource Management (BRM) / Engine Room Resource Management (ERM) Certificate', categoryId: 4 },
    { id: 33, name: 'Electronic Chart Display and Information System (ECDIS) Certificate', categoryId: 4 },
    { id: 34, name: 'Tankerman Endorsement / Specialized Training for Oil, Chemical, or Liquefied Gas Tankers Certificate', categoryId: 4 },
    { id: 35, name: 'High Voltage Training Certificate', categoryId: 4 },
    { id: 36, name: 'Shipboard Safety Officer Certificate', categoryId: 4 },
  ];

  const [forms, setForms] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [formFields, setFormFields] = useState([]);
  const [isCreatingNewForm, setIsCreatingNewForm] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [editingFormId, setEditingFormId] = useState(null);

  // State for vessel filtering
  const vesselTypes = [
    'Container Ship',
    'Yacht',
    'Bulk Carrier',
    'Chemical Carrier',
    'Product Carrier',
    'Crude Oil Carrier',
    'LNG',
  ];

  const [flagStates, setFlagStates] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [selectedVesselTypes, setSelectedVesselTypes] = useState(vesselTypes);
  const [selectedFlagStates, setSelectedFlagStates] = useState([]);
  const [selectedRegistrations, setSelectedRegistrations] = useState([]);
  const [grossTonnageMin, setGrossTonnageMin] = useState(0);
  const [grossTonnageMax, setGrossTonnageMax] = useState(999999999);
  const [lengthMin, setLengthMin] = useState(0);
  const [lengthMax, setLengthMax] = useState(999999999);
  const [showApplicability, setShowApplicability] = useState(false);

  useEffect(() => {
    fetchForms();
    fetchVesselParams();
  }, []);

  const fetchForms = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('http://localhost:5001/api/forms/definitions', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setForms(response.data);
    } catch (error) {
      console.error('Error fetching forms:', error);
    }
  };

  const fetchVesselParams = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('http://localhost:5001/api/vessels/params', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setFlagStates(response.data.flagStates);
      setRegistrations(response.data.typeOfRegistrations);

      // Set default selection to all options
      setSelectedFlagStates(response.data.flagStates);
      setSelectedRegistrations(response.data.typeOfRegistrations);
    } catch (error) {
      console.error('Error fetching vessel params:', error);
    }
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setSelectedSubcategory('');
    setFormFields([]);
  };

  const handleSubcategoryChange = (e) => {
    setSelectedSubcategory(e.target.value);
    setFormFields([]);
  };

  const handleFieldChange = (index, field, value) => {
    const updatedFields = [...formFields];
    updatedFields[index][field] = value;
    setFormFields(updatedFields);
  };

  const handleAddField = () => {
    setFormFields([...formFields, { field_name: '', field_description: '', field_type: 'text', options: [], required: false }]);
  };

  const handleDeleteField = (index) => {
    const updatedFields = formFields.filter((_, i) => i !== index);
    setFormFields(updatedFields);
  };

  const handleCheckboxChange = (value, list, setList) => {
    const updatedList = list.includes(value)
      ? list.filter(item => item !== value)
      : [...list, value];
    setList(updatedList);
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = {};

    if (!newItemName) {
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
        field_description: field.field_description || '',
        field_type: field.field_type || 'text',
        options: ['dropdown', 'radio'].includes(field.field_type) ? field.options || [] : undefined,
        required: field.required || false,
      }));

      const payload = {
        form_name: newItemName,
        category: selectedCategory,
        fields: updatedFields,
        subcategory: selectedSubcategory,
        applicableVesselTypes: selectedVesselTypes,
        applicableFlagStates: selectedFlagStates,
        applicableRegistrations: selectedRegistrations,
        gross_tonnage_min: grossTonnageMin,
        gross_tonnage_max: grossTonnageMax,
        length_min: lengthMin,
        length_max: lengthMax,
      };

      const token = localStorage.getItem('authToken');

      if (editingFormId) {
        await axios.put(`http://localhost:5001/api/forms/definitions/${editingFormId}`, payload, {
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

      fetchForms();
      setIsCreatingNewForm(false);
      setSuccessMessage('Form saved successfully');
      setTimeout(() => {
        setSuccessMessage('');
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Error saving form:', error);
      if (error.response && error.response.data) {
        console.error('Server Response:', error.response.data);
      }
    }
  };

  const handleEdit = (form) => {
    setSelectedCategory(form.category);
    setSelectedSubcategory(form.subcategory);
    setNewItemName(form.form_name);
    setFormFields(form.fields);
    setSelectedVesselTypes(form.applicableVesselTypes || vesselTypes);
    setSelectedFlagStates(form.applicableFlagStates || []);
    setSelectedRegistrations(form.applicableRegistrations || []);
    setGrossTonnageMin(form.gross_tonnage_min || 0);
    setGrossTonnageMax(form.gross_tonnage_max || 999999999);
    setLengthMin(form.length_min || 0);
    setLengthMax(form.length_max || 999999999);
    setEditingFormId(form._id);
    setIsCreatingNewForm(true);
  };

  const handleDelete = async (formId) => {
    if (window.confirm('Are you sure you want to delete this form?')) {
      try {
        const token = localStorage.getItem('authToken');
        await axios.delete(`http://localhost:5001/api/forms/definitions/${formId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        fetchForms();
      } catch (error) {
        console.error('Error deleting form:', error);
      }
    }
  };

  return (
    <div className="form-editor-container">
      <h1>Form Editor</h1>
      {successMessage && <div className="success-message">{successMessage}</div>}
      
      <button onClick={() => {
        setIsCreatingNewForm(true);
        setEditingFormId(null);
        setSelectedCategory('');
        setSelectedSubcategory('');
        setNewItemName('');
        setFormFields([]);
        setSelectedVesselTypes(vesselTypes);
        setSelectedFlagStates(flagStates);
        setSelectedRegistrations(registrations);
        setGrossTonnageMin(0);
        setGrossTonnageMax(999999999);
        setLengthMin(0);
        setLengthMax(999999999);
      }}>
        Create New Form
      </button>

      <table className="forms-table">
        <thead>
          <tr>
            <th>Form Name</th>
            <th>Category</th>
            <th>Subcategory</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {forms.map((form) => (
            <tr key={form._id}>
              <td>{form.form_name}</td>
              <td>{form.category}</td>
              <td>{form.subcategory}</td>
              <td>
                <button className="action-icon" onClick={() => handleEdit(form)}>
                  <FontAwesomeIcon icon={faEdit} style={{ color: 'orange' }} />
                </button>
                <button className="action-icon trash-icon" onClick={() => handleDelete(form._id)}>
                  <FontAwesomeIcon icon={faTrashAlt} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isCreatingNewForm && (
        <div className="overlay">
          <div className="modal">
            <h2>{editingFormId ? 'Edit Form' : 'Create New Form'}</h2>
            <div className="form-editor-controls">
              <select value={selectedCategory} onChange={handleCategoryChange}>
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>{category.name}</option>
                ))}
              </select>
              {selectedCategory && (
                <select value={selectedSubcategory} onChange={handleSubcategoryChange}>
                  <option value="">Select Subcategory</option>
                  {subCategories
                    .filter((sub) => sub.categoryId === categories.find((cat) => cat.name === selectedCategory).id)
                    .map((subcategory) => (
                      <option key={subcategory.id} value={subcategory.name}>{subcategory.name}</option>
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
            </div>

            {/* Applicability Toggle */}
            <button
              className="applicability-toggle"
              onClick={() => setShowApplicability(!showApplicability)}
            >
              {showApplicability ? 'Hide Applicability' : 'Show Applicability'}
            </button>

            {showApplicability && (
              <div className="applicability-section">
                <div className="form-editor-controls">
                  <label>Applicable Vessel Types</label>
                  <div className="checkbox-group">
                    {vesselTypes.map((type) => (
                      <label key={type} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={selectedVesselTypes.includes(type)}
                          onChange={() => handleCheckboxChange(type, selectedVesselTypes, setSelectedVesselTypes)}
                        />
                        {type}
                      </label>
                    ))}
                  </div>

                  <label>Applicable Flag States</label>
                  <div className="checkbox-group">
                    {flagStates.map((flag) => (
                      <label key={flag} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={selectedFlagStates.includes(flag)}
                          onChange={() => handleCheckboxChange(flag, selectedFlagStates, setSelectedFlagStates)}
                        />
                        {flag}
                      </label>
                    ))}
                  </div>

                  <label>Applicable Registrations</label>
                  <div className="checkbox-group">
                    {registrations.map((reg) => (
                      <label key={reg} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={selectedRegistrations.includes(reg)}
                          onChange={() => handleCheckboxChange(reg, selectedRegistrations, setSelectedRegistrations)}
                        />
                        {reg}
                      </label>
                    ))}
                  </div>

                  <div className="field-row">
                    <div className="field-column">
                      <label>Gross Tonnage (Min)</label>
                      <input
                        type="number"
                        placeholder="Min Gross Tonnage"
                        value={grossTonnageMin}
                        onChange={(e) => setGrossTonnageMin(e.target.value)}
                      />
                    </div>
                    <div className="field-column">
                      <label>Gross Tonnage (Max)</label>
                      <input
                        type="number"
                        placeholder="Max Gross Tonnage"
                        value={grossTonnageMax}
                        onChange={(e) => setGrossTonnageMax(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="field-row">
                    <div className="field-column">
                      <label>Length (Min)</label>
                      <input
                        type="number"
                        placeholder="Min Length"
                        value={lengthMin}
                        onChange={(e) => setLengthMin(e.target.value)}
                      />
                    </div>
                    <div className="field-column">
                      <label>Length (Max)</label>
                      <input
                        type="number"
                        placeholder="Max Length"
                        value={lengthMax}
                        onChange={(e) => setLengthMax(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

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
                        value={field.field_description}
                        onChange={(e) => handleFieldChange(index, 'field_description', e.target.value)}
                        placeholder="Field Description"
                      />
                    </div>
                    <div className="field-column">
                      <label>Field Type</label>
                      <select
                        value={field.field_type}
                        onChange={(e) => handleFieldChange(index, 'field_type', e.target.value)}
                      >
                        {/* Options for field types */}
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
                    <div className="field-column">
                      <label>Required</label>
                      <input
                        type="checkbox"
                        className="custom-checkbox"
                        checked={field.required}
                        onChange={(e) => handleFieldChange(index, 'required', e.target.checked)}
                      />
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
                    <button onClick={() => handleDeleteField(index)}>Delete</button>
                  </div>
                </div>
              ))}
              <button onClick={handleAddField}>Add Field</button>
            </div>
            <div className="modal-actions">
              <button onClick={handleSave}>{editingFormId ? 'Save Changes' : 'Save Form'}</button>
              <button onClick={() => setIsCreatingNewForm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormEditorComponent;
