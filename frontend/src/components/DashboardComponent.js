import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import ChatComponent from './ChatComponent';
import './DashboardComponent.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faComments, faEdit, faPaperclip, faAngleDoubleLeft, faAngleDoubleRight } from '@fortawesome/free-solid-svg-icons';

Modal.setAppElement('#root');

const formatDate = (dateString) => {
  const options = { day: '2-digit', month: 'long', year: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-GB', options);
};

const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  const options = { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' };
  return date.toLocaleString('en-GB', options).replace(',', ' at');
};

function DashboardComponent({ setToken }) {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({
    name: '',
    category: '',
    subcategory: '',
    dueDate: '',
    attachments: [],
    title: '',
    vessel: '',
    customName: '',
    role: '',
    formDefinitionId: '',
    isRecurring: false,
    recurrenceFrequency: '',
    recurrenceInterval: '',
    recurrenceBasis: 'initial',
  });

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [filterCategory, setFilterCategory] = useState('');
  const [filterSubcategory, setFilterSubcategory] = useState('');
  const [filterItem, setFilterItem] = useState('');
  const [vessels, setVessels] = useState([]);
  const [selectedVessel, setSelectedVessel] = useState('');
  const [role, setRole] = useState('');
  const [completedFilter, setCompletedFilter] = useState('All');
  const [showChat, setShowChat] = useState(null);
  const [unreadComments, setUnreadComments] = useState({});
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedFormDefinition, setSelectedFormDefinition] = useState(null);
  const [formFields, setFormFields] = useState({});

  const fetchItems = async (subcategory = '') => {
    try {
      const token = localStorage.getItem('authToken');
      const url = subcategory
        ? `http://localhost:5001/api/items?subcategory=${subcategory}`
        : `http://localhost:5001/api/items`;
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setItems(response.data);
    } catch (error) {
      setError('Error fetching items');
    }
  };

  const fetchVessels = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await axios.get('http://localhost:5001/api/vessels', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      let userVessels;
      if (user.role === 'Superuser') {
        userVessels = response.data;
      } else {
        userVessels = response.data.filter((vessel) => user.assignedVessels.includes(vessel._id));
      }

      setVessels(userVessels);
    } catch (error) {
      setError('Error fetching vessels');
    }
  };

  const fetchUserRole = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await axios.get('http://localhost:5001/api/users/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setRole(response.data.role);
  
      if (response.data.role === 'Captain' || response.data.role === 'Crew') {
        setNewItem((prevItem) => ({
          ...prevItem,
          vessel: user.assignedVessels[0],
        }));
      } else {
        setNewItem((prevItem) => ({
          ...prevItem,
          role: response.data.role,
        }));
      }
    } catch (error) {
      setError('There was an error fetching the user role, please login again.');
    }
  };
  
  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('http://localhost:5001/api/forms/definitions', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const categories = [...new Set(response.data.map((form) => form.category))];
      setCategories(categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchSubcategoriesByCategory = async (category) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`http://localhost:5001/api/forms/subcategories/${category}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSubcategories(response.data);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
    }
  };

  useEffect(() => {
    const fetchFormDefinitions = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('Authentication token is missing');
        }
    
        const response = await axios.get('http://localhost:5001/api/forms/definitions', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            vessel: newItem.vessel,
          },
        });
    
        const formDefinitions = response.data;
    
        const categories = [...new Set(formDefinitions.map(form => form.category))];
        setCategories(categories);
    
        setItemOptions(formDefinitions);
      } catch (error) {
        console.error('Error fetching form definitions:', error);
        setError('Error fetching form definitions.');
      }
    };
  
    fetchItems();
    fetchVessels();
    fetchUserRole();
    fetchCategories();
    fetchFormDefinitions();
    checkAllUnreadComments();
  }, [newItem.vessel]);

  const checkAllUnreadComments = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('http://localhost:5001/api/chats/allUnreadComments', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const unreadCommentsMap = response.data.reduce((acc, chat) => {
        acc[chat.documentId] = true;
        return acc;
      }, {});
      setUnreadComments(unreadCommentsMap);
    } catch (error) {
      console.error('Error checking unread comments:', error.response ? error.response.data : error.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setNewItem((prevItem) => ({
      ...prevItem,
      [name]: value,
    }));
  
    if (name === 'category') {
      const selectedCategory = value;
  
      const subcategories = itemOptions
        .filter((form) => form.category === selectedCategory)
        .map((form) => form.subcategory);
  
      setSubcategories([...new Set(subcategories)]);
  
      setNewItem((prevItem) => ({
        ...prevItem,
        subcategory: '',
        name: '',
        customName: '',
      }));
    } else if (name === 'subcategory') {
      const selectedSubcategory = value;
  
      const filteredItems = itemOptions.filter(
        (form) =>
          form.category === newItem.category && form.subcategory === selectedSubcategory
      );
  
      setItemOptions(filteredItems);
  
      setNewItem((prevItem) => ({
        ...prevItem,
        name: '',
      }));
    } else if (name === 'name') {
      const selectedItem = itemOptions.find(item => item._id === value);
  
      setNewItem((prevItem) => ({
        ...prevItem,
        formDefinitionId: selectedItem ? selectedItem._id : '',
      }));

      // Set the form fields when a form is selected
      if (selectedItem) {
        const fields = selectedItem.fields.reduce((acc, field) => {
          acc[field.field_name] = '';
          return acc;
        }, {});
        setFormFields(fields);
      }
    }
  };  
  
  const validateForm = () => {
    const errors = [];
    if (!newItem.category) errors.push('Category is required');
    if ((newItem.category === 'Form or Checklist' || newItem.category === 'Document') && !newItem.subcategory)
      errors.push('Subcategory is required');
    if ((newItem.category === 'Form or Checklist' || newItem.category === 'Document') && !newItem.name && !newItem.customName)
      errors.push('Item name is required');
    if (newItem.category === 'Track a Date' && !newItem.title) errors.push('Title is required');
    if (!newItem.dueDate) errors.push('Due date is required');
    if (!newItem.vessel && (role === 'Superuser' || role === 'Company User')) errors.push('Vessel is required');
    if (newItem.formDefinitionId === '669edf84beec7dd7fcd9b5f0' && !newItem.type) errors.push('Type is required');
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (errors.length > 0) {
        setValidationErrors(errors);
        return;
    }

    try {
        const token = localStorage.getItem('authToken');
        const formData = new FormData();

        formData.append('category', newItem.category);
        formData.append('dueDate', newItem.dueDate);
        formData.append('vessel', newItem.vessel);
        formData.append('role', newItem.role);
        formData.append('formDefinitionId', newItem.formDefinitionId);

        // Fetch the form_name using the formDefinitionId before appending it to the formData
        let itemName = newItem.name === 'custom' ? newItem.customName : '';

        if (!itemName) {
            const selectedForm = itemOptions.find(
                (form) => form._id === newItem.formDefinitionId
            );
            if (selectedForm) {
                itemName = selectedForm.form_name;
            } else {
                setError('Form name not found.');
                return;
            }
        }

        if (newItem.formDefinitionId === '669edf84beec7dd7fcd9b5f0') {
            const typeName = newItem.type === 'Other' ? newItem.customType : newItem.type;
            itemName += ` - ${typeName}`;
        }

        formData.append('name', itemName);

        if (newItem.category === 'Form or Checklist' || newItem.category === 'Document') {
            formData.append('subcategory', newItem.subcategory);
        }

        if (newItem.category === 'Track a Date') {
            formData.append('title', newItem.title);
        }

        if (newItem.category === 'Document' && newItem.attachments.length > 0) {
            newItem.attachments.forEach((file) => {
                formData.append('attachments', file);
            });
        }

        if (newItem.isRecurring) {
            formData.append('isRecurring', newItem.isRecurring);
            formData.append('recurrenceFrequency', newItem.recurrenceFrequency);
            formData.append('recurrenceInterval', newItem.recurrenceInterval);
            formData.append('recurrenceBasis', newItem.recurrenceBasis);
        }

        // Add dynamic form fields to the formData
        Object.keys(formFields).forEach((fieldName) => {
          formData.append(fieldName, formFields[fieldName]);
        });

        const response = await axios.post('http://localhost:5001/api/items', formData, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        setItems([...items, response.data]);
        setNewItem({
            name: '',
            category: '',
            subcategory: '',
            dueDate: '',
            attachments: [],
            title: '',
            vessel: '',
            customName: '',
            role: newItem.role,
            formDefinitionId: '',
            isRecurring: false,
            recurrenceFrequency: '',
            recurrenceInterval: '',
            recurrenceBasis: 'initial',
            type: '',
            customType: '',
        });
        setFormFields({}); // Clear form fields after submission
        setIsModalOpen(false);
        fetchItems();
        setValidationErrors([]);
    } catch (error) {
        setError('Error adding item');
        console.error('Error adding item:', error.response ? error.response.data : error.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(`http://localhost:5001/api/items/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setItems(items.filter((item) => item._id !== id));
    } catch (error) {
      setError('Error deleting item');
    }
  };

  const calculateStatusColor = (item) => {
    if (item.completed && item.pdfPath) {
      return 'blue';
    }

    const dueDate = new Date(item.dueDate);
    const currentDate = new Date();
    const dateDiff = (dueDate - currentDate) / (1000 * 60 * 60 * 24);

    if (dateDiff > 90) return 'green';
    if (dateDiff <= 90 && dateDiff > 30) return 'yellow';
    if (dateDiff <= 30 && dateDiff > 0) return 'orange';
    return 'red';
  };

  const handleCompleteForm = async (formDefinitionId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`http://localhost:5001/api/forms/definitions/${formDefinitionId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const formDefinition = response.data;
      setSelectedFormDefinition(formDefinition);
      setIsFormModalOpen(true);
    } catch (error) {
      console.error('Error fetching form definition:', error);
    }
  };

  const handleFileChange = (e, fieldName) => {
    setFormFields((prevFormFields) => ({
      ...prevFormFields,
      [fieldName]: e.target.files[0],
    }));
  };

  const handleFieldChange = (e, fieldName) => {
    setFormFields((prevFormFields) => ({
      ...prevFormFields,
      [fieldName]: e.target.value,
    }));
  };

  const closeFormModal = () => {
    setIsFormModalOpen(false);
    setSelectedFormDefinition(null);
  };

  const filteredAndSortedItems = () => {
    let filteredItems = items;

    if (filterCategory) {
      filteredItems = filteredItems.filter((item) => item.category === filterCategory);
    }

    if (filterSubcategory) {
      filteredItems = filteredItems.filter((item) => item.subcategory === filterSubcategory);
    }

    if (filterItem) {
      filteredItems = filteredItems.filter((item) => item.name === filterItem);
    }

    if (selectedVessel) {
      filteredItems = filteredItems.filter((item) => item.vessel && item.vessel._id === selectedVessel);
    }

    if (completedFilter === 'Completed') {
      filteredItems = filteredItems.filter((item) => item.completed);
    } else if (completedFilter === 'Outstanding') {
      filteredItems = filteredItems.filter((item) => !item.completed);
    }

    if (!sortConfig.key) return filteredItems;

    return [...filteredItems].sort((a, b) => {
      const aValue =
        sortConfig.key === 'submitted'
          ? new Date(a.updatedAt)
          : sortConfig.key === 'vessel'
          ? a.vessel
            ? a.vessel.name
            : ''
          : sortConfig.key === 'dueDate'
          ? new Date(a.dueDate)
          : a[sortConfig.key] || '';
      const bValue =
        sortConfig.key === 'submitted'
          ? new Date(b.updatedAt)
          : sortConfig.key === 'vessel'
          ? b.vessel
            ? b.vessel.name
            : ''
          : sortConfig.key === 'dueDate'
          ? new Date(b.dueDate)
          : b[sortConfig.key] || '';

      if (sortConfig.key === 'dueDate') {
        if (a.completed && a.pdfPath && !(b.completed && b.pdfPath)) return 1;
        if (!(a.completed && a.pdfPath) && b.completed && b.pdfPath) return -1;
      }

      if (sortConfig.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const markCommentsAsRead = async (documentId) => {
    try {
      const token = localStorage.getItem('authToken');
      const userId = JSON.parse(localStorage.getItem('user'))._id;
      await axios.post(
        'http://localhost:5001/api/chats/markAsRead',
        { documentId, userId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUnreadComments((prevUnreadComments) => ({
        ...prevUnreadComments,
        [documentId]: false,
      }));
    } catch (error) {
      console.error('Error marking comments as read:', error.response ? error.response.data : error.message);
    }
  };

  const handleToggleChat = (itemId) => {
    setShowChat(showChat === itemId ? null : itemId);
    if (showChat !== itemId) {
      markCommentsAsRead(itemId);
    }
  };

  useEffect(() => {
    const checkAllUnreadComments = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get('http://localhost:5001/api/chats/allUnreadComments', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        const unreadCommentsMap = response.data.reduce((acc, chat) => {
            if (!acc[chat.documentId]) {
                acc[chat.documentId] = true;
            }
            return acc;
        }, {});
        setUnreadComments(unreadCommentsMap);
      } catch (error) {
        console.error('Error checking unread comments:', error.response ? error.response.data : error.message);
      }
    };

    checkAllUnreadComments();
  }, [items]);

  const handleFilterCategoryChange = (e) => {
    const selectedCategory = e.target.value;
    setFilterCategory(selectedCategory);
    setFilterSubcategory('');
    setFilterItem('');
    if (selectedCategory) {
      fetchSubcategoriesByCategory(selectedCategory);
    } else {
      setSubcategories([]);
    }
  };

  const handleFilterSubcategoryChange = (e) => {
    const selectedSubcategory = e.target.value;
    setFilterSubcategory(selectedSubcategory);
    setFilterItem('');
    if (selectedSubcategory) {
      fetchItems(selectedSubcategory);
    } else {
      fetchItems();
      setItemOptions([]);
    }
  };

  const handleFilterItemChange = (e) => {
    setFilterItem(e.target.value);
  };

  const handleClearFilters = () => {
    setFilterCategory('');
    setFilterSubcategory('');
    setFilterItem('');
    setSelectedVessel('');
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className={`dashboard-layout ${isSidebarCollapsed ? 'collapsed' : ''}`}>
      <div className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-toggle-container">
          <div className="sidebar-toggle-btn" onClick={toggleSidebar}>
            <FontAwesomeIcon icon={isSidebarCollapsed ? faAngleDoubleRight : faAngleDoubleLeft} />
          </div>
        </div>
        {!isSidebarCollapsed && (
          <div className="filters">
            <select
              name="filterVessel"
              value={selectedVessel}
              onChange={(e) => setSelectedVessel(e.target.value)}
            >
              <option value="">Filter by Vessel</option>
              {vessels.map((vessel) => (
                <option key={vessel._id} value={vessel._id}>
                  {vessel.name}
                </option>
              ))}
            </select>
            <select name="filterCategory" value={filterCategory} onChange={handleFilterCategoryChange}>
              <option value="">Filter by Category</option>
              {categories.map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <select
              name="filterSubcategory"
              value={filterSubcategory}
              onChange={handleFilterSubcategoryChange}
              disabled={!filterCategory}
            >
              <option value="">Filter by Subcategory</option>
              {subcategories.map((subcategory, index) => (
                <option key={index} value={subcategory}>
                  {subcategory}
                </option>
              ))}
            </select>
            <select
              name="filterItem"
              value={filterItem}
              onChange={handleFilterItemChange}
              disabled={!filterSubcategory}
            >
              <option value="">Filter by Item</option>
              {itemOptions.map((item, index) => (
                <option key={item._id} value={item.form_name}>
                  {item.form_name}
                </option>
              ))}
            </select>
            <button onClick={handleClearFilters}>Clear Filters</button>
            <div className="show-completed">
              <label>
                Show:
                <select value={completedFilter} onChange={(e) => setCompletedFilter(e.target.value)}>
                  <option value="All">All</option>
                  <option value="Outstanding">Outstanding</option>
                  <option value="Completed">Completed</option>
                </select>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Main content area */}
      <div className="main-content">
        <button onClick={openModal} className="add-item-button">
          Add New Item
        </button>
        <Modal
          isOpen={isModalOpen}
          onRequestClose={closeModal}
          contentLabel="Add New Item"
          className="modal"
          overlayClassName="modal-overlay"
        >
          <h2>Add New Item</h2>
          <form onSubmit={handleSubmit} className="new-item-form">
            {(role === 'Superuser' || role === 'Company User') && (
              <select name="vessel" value={newItem.vessel} onChange={handleInputChange} required>
                <option value="">Select Vessel</option>
                {vessels.map((vessel) => (
                  <option key={vessel._id} value={vessel._id}>
                    {vessel.name}
                  </option>
                ))}
              </select>
            )}

            <select name="category" value={newItem.category} onChange={handleInputChange} required>
              <option value="">Select Category</option>
              {categories.map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))}
            </select>

            {newItem.category && newItem.category !== 'Track a Date' && newItem.category !== 'Crew' && (
              <>
                <select
                  name="subcategory"
                  value={newItem.subcategory}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Subcategory</option>
                  {subcategories.map((subcategory, index) => (
                    <option key={index} value={subcategory}>
                      {subcategory}
                    </option>
                  ))}
                </select>

                <select name="name" value={newItem.formDefinitionId} onChange={handleInputChange} required>
                  <option value="">Select Item</option>
                  {itemOptions.map((item, index) => (
                    <option key={item._id} value={item._id}>
                      {item.form_name}
                    </option>
                  ))}
                  <option value="custom">Custom</option>
                </select>

                {newItem.name === 'custom' && (
                  <input
                    type="text"
                    name="customName"
                    value={newItem.customName}
                    onChange={handleInputChange}
                    placeholder="Enter custom item name"
                    maxLength="75"
                    required
                  />
                )}

                {/* Render dynamic form fields based on selected form definition */}
                {selectedFormDefinition && selectedFormDefinition.fields.map((field) => (
                  <div key={field._id} className="form-field">
                    <label>{field.field_name}</label>
                    {field.field_type === 'file' ? (
                      <input type="file" name={field.field_name} onChange={(e) => handleFileChange(e, field.field_name)} />
                    ) : (
                      <input
                        type={field.field_type}
                        name={field.field_name}
                        value={formFields[field.field_name] || ''}
                        onChange={(e) => handleFieldChange(e, field.field_name)}
                        required={field.required}
                      />
                    )}
                  </div>
                ))}
              </>
            )}

            {newItem.category === 'Track a Date' && (
              <>
                <input
                  type="text"
                  name="title"
                  value={newItem.title}
                  onChange={handleInputChange}
                  placeholder="Title"
                  required
                />
              </>
            )}

            <input
              type="date"
              name="dueDate"
              value={newItem.dueDate}
              onChange={handleInputChange}
              required
            />

            <label>
              Recurring?
              <input
                type="checkbox"
                name="isRecurring"
                checked={newItem.isRecurring}
                onChange={(e) =>
                  setNewItem((prevItem) => ({
                    ...prevItem,
                    isRecurring: e.target.checked,
                  }))
                }
              />
            </label>

            {newItem.isRecurring && (
              <>
                <select
                  name="recurrenceFrequency"
                  value={newItem.recurrenceFrequency}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Recurrence Frequency</option>
                  <option value="week">Week</option>
                  <option value="month">Month</option>
                  <option value="year">Year</option>
                </select>

                <input
                  type="number"
                  name="recurrenceInterval"
                  value={newItem.recurrenceInterval}
                  onChange={handleInputChange}
                  placeholder="Recurrence Interval"
                  required
                />

                <select
                  name="recurrenceBasis"
                  value={newItem.recurrenceBasis}
                  onChange={handleInputChange}
                  required
                >
                  <option value="initial">Initial</option>
                  <option value="completion">Completion</option>
                </select>
              </>
            )}

            <button type="submit">Add Item</button>
          </form>
          <button 
            onClick={closeModal}
            style={{ marginTop: '20px' }}
          >
            Close
          </button>
        </Modal>

        {/* Form Modal */}
        <Modal
          isOpen={isFormModalOpen}
          onRequestClose={closeFormModal}
          contentLabel="Complete Form"
          className="modal"
          overlayClassName="modal-overlay"
          style={{ content: { width: '80%', height: '90%', margin: 'auto' } }}
        >
          <button onClick={closeFormModal} className="modal-close-button">
            &times;
          </button>
          {selectedFormDefinition && (
            <form onSubmit={handleSubmit} className="new-item-form">
              {selectedFormDefinition.fields.map((field) => (
                <div key={field._id} className="form-field">
                  <label>{field.field_name}</label>
                  {field.field_type === 'file' ? (
                    <input type="file" name={field.field_name} onChange={(e) => handleFileChange(e, field.field_name)} />
                  ) : (
                    <input
                      type={field.field_type}
                      name={field.field_name}
                      value={formFields[field.field_name] || ''}
                      onChange={(e) => handleFieldChange(e, field.field_name)}
                      required={field.required}
                    />
                  )}
                </div>
              ))}
              <button type="submit">Submit Form</button>
            </form>
          )}
        </Modal>

        {error && <p>{error}</p>}
        {validationErrors.length > 0 && (
          <div className="validation-errors">
            <ul>
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>
                  <button type="button" onClick={() => requestSort('vessel')}>
                    Vessel {sortConfig.key === 'vessel' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </button>
                </th>
                <th>Status</th>
                <th>
                  <button type="button" onClick={() => requestSort('category')}>
                    Category {sortConfig.key === 'category' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </button>
                </th>
                <th>
                  <button type="button" onClick={() => requestSort('subcategory')}>
                    Subcategory {sortConfig.key === 'subcategory' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </button>
                </th>
                <th>
                  <button type="button" onClick={() => requestSort('name')}>
                    Item {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </button>
                </th>
                <th>
                  <button type="button" onClick={() => requestSort('dueDate')}>
                    Due/Expiry Date {sortConfig.key === 'dueDate' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </button>
                </th>
                <th>Recurring</th>
                <th>
                  <button type="button" onClick={() => requestSort('submitted')}>
                    Submitted {sortConfig.key === 'submitted' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </button>
                </th>
                <th>
                  <FontAwesomeIcon icon={faPaperclip} />
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedItems().map((item, index) => {
                const isCompleted = item.completed && item.pdfPath;
                const showChatForItem = showChat === item._id;
                return (
                  <React.Fragment key={item._id || `fragment-${index}`}>
                    <tr className={isCompleted ? 'completed-row' : ''} key={`row-${item._id || index}`}>
                      <td>{item.vessel ? item.vessel.name : 'N/A'}</td>
                      <td>
                        <span
                          className="status-dot"
                          style={{ backgroundColor: calculateStatusColor(item) }}
                        ></span>
                      </td>
                      <td>{item.category}</td>
                      <td>{item.subcategory || 'N/A'}</td>
                      <td>{item.name || item.title}</td>
                      <td>{isCompleted ? 'Completed' : item.dueDate ? formatDate(item.dueDate) : ''}</td>
                      <td>{item.isRecurring ? `Every ${item.recurrenceInterval} ${item.recurrenceFrequency}(s) by ${item.recurrenceBasis}` : 'No'}</td>
                      <td>{item.updatedAt ? formatDateTime(item.updatedAt) : 'N/A'}</td>
                      <td>
                        {item.category === 'Form or Checklist' ? (
                          item.completed ? (
                            item.pdfPath ? (
                              <a
                                href={`http://localhost:5001${item.pdfPath}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <FontAwesomeIcon icon={faPaperclip} />
                              </a>
                            ) : (
                              ''
                            )
                          ) : (
                            ''
                          )
                        ) : item.attachments.length > 0 ? (
                          item.attachments.map((attachment, attIndex) => (
                            <a
                              key={`attachment-${item._id || index}-${attIndex}`}
                              href={`http://localhost:5001/uploads/${attachment}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <FontAwesomeIcon icon={faPaperclip} />
                            </a>
                          ))
                        ) : (
                          ''
                        )}
                      </td>
                      <td>
                        <button className="action-icon trash-icon" onClick={() => handleDelete(item._id)}>
                          <FontAwesomeIcon icon={faTrashAlt} />
                        </button>
                        <button
                          className="action-icon"
                          onClick={() => handleToggleChat(item._id)}
                          style={{
                            color: showChatForItem ? 'black' : unreadComments[item._id] ? 'orange' : '#3eb4e4',
                          }}
                        >
                          <FontAwesomeIcon icon={faComments} />
                        </button>
                        {!item.completed && item.category === 'Form or Checklist' && (
                          <button
                            className="action-icon"
                            onClick={() => handleCompleteForm(item.formDefinitionId)}
                          >
                            <FontAwesomeIcon icon={faEdit} style={{ color: 'orange' }} />
                          </button>
                        )}
                      </td>
                    </tr>
                    {showChatForItem && (
                      <tr key={`chat-${item._id || index}`} className="chat-row">
                        <td colSpan="10">
                          <ChatComponent documentId={item._id} itemName={item.name || item.title} markAsRead={markCommentsAsRead} />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>

          </table>
        </div>
      </div>
    </div>
  );
}

export default DashboardComponent;
