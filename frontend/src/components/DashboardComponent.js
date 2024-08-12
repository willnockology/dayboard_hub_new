import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import ChatComponent from './ChatComponent';
import './DashboardComponent.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faComments, faEdit, faPaperclip, faAngleDoubleLeft, faAngleDoubleRight } from '@fortawesome/free-solid-svg-icons';

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
    type: '',
    customType: '',
  });
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState([]);
  const [showForm, setShowForm] = useState(false);
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

  const history = useHistory();

  const fetchItems = async (subcategory = '') => {
    try {
      const token = localStorage.getItem('authToken');
      const url = subcategory ? `http://localhost:5001/api/items?subcategory=${subcategory}` : `http://localhost:5001/api/items`;
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
        userVessels = response.data.filter(vessel => user.assignedVessels.includes(vessel._id));
      }

      setVessels(userVessels);
    } catch (error) {
      setError('Error fetching vessels');
    }
  };

  const fetchUserRole = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('http://localhost:5001/api/users/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setRole(response.data.role);
      setNewItem((prevItem) => ({
        ...prevItem,
        role: response.data.role,
      }));
    } catch (error) {
      setError('Error fetching user role');
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
      const categories = [...new Set(response.data.map(form => form.category))];
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

  const fetchFormDefinitions = async (category, subcategory) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`http://localhost:5001/api/forms/definitions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          category,
          subcategory,
        },
      });
      setItemOptions(response.data);
    } catch (error) {
      console.error('Error fetching form definitions:', error);
    }
  };

  useEffect(() => {
    fetchItems();
    fetchVessels();
    fetchUserRole();
    fetchCategories();
    checkAllUnreadComments();
  }, []);

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
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setNewItem((prevItem) => ({
      ...prevItem,
      [name]: val,
    }));

    if (name === 'category') {
      fetchSubcategoriesByCategory(value);
      setNewItem((prevItem) => ({
        ...prevItem,
        subcategory: '',
        name: '',
        customName: '',
        dueDate: '',
        type: '',
        customType: '',
      }));
      setItemOptions([]);
    } else if (name === 'subcategory') {
      fetchFormDefinitions(newItem.category, value);
      setNewItem((prevItem) => ({
        ...prevItem,
        name: '',
        customName: '',
        dueDate: '',
        type: '',
        customType: '',
      }));
    } else if (name === 'name') {
      const selectedItem = itemOptions.find(item => item.form_name === value);
      if (selectedItem) {
        setNewItem((prevItem) => ({
          ...prevItem,
          formDefinitionId: selectedItem._id,
          type: '',
          customType: '',
        }));
      } else {
        setNewItem((prevItem) => ({
          ...prevItem,
          formDefinitionId: '',
        }));
      }
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setNewItem((prevItem) => ({
      ...prevItem,
      attachments: files,
    }));
  };

  const handleTypeChange = (e) => {
    const { value } = e.target;
    setNewItem((prevItem) => ({
      ...prevItem,
      type: value,
      customType: value === 'Other' ? prevItem.customType : '',
    }));
  };

  const handleCustomTypeChange = (e) => {
    const { value } = e.target;
    setNewItem((prevItem) => ({
      ...prevItem,
      customType: value,
    }));
  };

  const validateForm = () => {
    const errors = [];
    if (!newItem.category) errors.push('Category is required');
    if ((newItem.category === 'Form or Checklist' || newItem.category === 'Document') && !newItem.subcategory) errors.push('Subcategory is required');
    if ((newItem.category === 'Form or Checklist' || newItem.category === 'Document') && !newItem.name && !newItem.customName) errors.push('Item name is required');
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

      let itemName = newItem.name === 'custom' ? newItem.customName : newItem.name;

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

      // Only append recurrence fields if isRecurring is true
      if ((role === 'Superuser' || role === 'Company User') && newItem.isRecurring) {
        formData.append('isRecurring', newItem.isRecurring);
        formData.append('recurrenceFrequency', newItem.recurrenceFrequency);
        formData.append('recurrenceInterval', newItem.recurrenceInterval);
        formData.append('recurrenceBasis', newItem.recurrenceBasis);
      } else {
        // If not recurring, ensure these fields are not included or set to undefined
        formData.append('isRecurring', false);
        formData.append('recurrenceFrequency', undefined);
        formData.append('recurrenceInterval', undefined);
        formData.append('recurrenceBasis', undefined);
      }

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
      setShowForm(false);
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
    const dateDiff = (dueDate - currentDate) / (1000 * 60 * 60 * 24); // Calculate date difference in days

    if (dateDiff > 90) return 'green';
    if (dateDiff <= 90 && dateDiff > 30) return 'yellow';
    if (dateDiff <= 30 && dateDiff > 0) return 'orange';
    return 'red';
  };

  const handleCompleteForm = async (formDefinitionId) => {
    if (formDefinitionId) {
      history.push(`/form/${formDefinitionId}`);
    } else {
      console.error('Form definition ID not found');
    }
  };

  const renderDateSelector = () => (
    <div className="date-input-container">
      <label htmlFor="dueDate">Due Date</label>
      <input
        type="date"
        name="dueDate"
        id="dueDate"
        value={newItem.dueDate}
        onChange={handleInputChange}
      />
      <img
        src="./assets/calendar-icon.png"
        alt="Calendar Icon"
        className="calendar-icon"
        onClick={() => document.getElementById('dueDate').focus()}
      />
    </div>
  );

  const filteredAndSortedItems = () => {
    let filteredItems = items;

    if (filterCategory) {
      filteredItems = filteredItems.filter(item => item.category === filterCategory);
    }

    if (filterSubcategory) {
      filteredItems = filteredItems.filter(item => item.subcategory === filterSubcategory);
    }

    if (filterItem) {
      filteredItems = filteredItems.filter(item => item.name === filterItem);
    }

    if (selectedVessel) {
      filteredItems = filteredItems.filter(item => item.vessel && item.vessel._id === selectedVessel);
    }

    if (completedFilter === 'Completed') {
      filteredItems = filteredItems.filter(item => item.completed);
    } else if (completedFilter === 'Outstanding') {
      filteredItems = filteredItems.filter(item => !item.completed);
    }

    if (!sortConfig.key) return filteredItems;
    return [...filteredItems].sort((a, b) => {
      const aValue = sortConfig.key === 'submitted' ? new Date(a.updatedAt) :
        sortConfig.key === 'vessel' ? (a.vessel ? a.vessel.name : '') :
          sortConfig.key === 'dueDate' ? new Date(a.dueDate) :
            a[sortConfig.key] || '';
      const bValue = sortConfig.key === 'submitted' ? new Date(b.updatedAt) :
        sortConfig.key === 'vessel' ? (b.vessel ? b.vessel.name : '') :
          sortConfig.key === 'dueDate' ? new Date(b.dueDate) :
            b[sortConfig.key] || '';
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
      await axios.post('http://localhost:5001/api/chats/markAsRead', { documentId, userId }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
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

  useEffect(() => {
    fetchItems();
  }, [history.location.pathname]);

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
            <select
              name="filterCategory"
              value={filterCategory}
              onChange={handleFilterCategoryChange}
            >
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
                <select
                  value={completedFilter}
                  onChange={(e) => setCompletedFilter(e.target.value)}
                >
                  <option value="All">All</option>
                  <option value="Outstanding">Outstanding</option>
                  <option value="Completed">Completed</option>
                </select>
              </label>
            </div>
            <div className="add-item-container">
              <button onClick={() => setShowForm(!showForm)} className="add-item-button">
                {showForm ? 'Hide Form' : 'Add New Item'}
              </button>
              {showForm && (
                <form onSubmit={handleSubmit} className="new-item-form">
                  {(role === 'Superuser' || role === 'Company User') && (
                    <select
                      name="vessel"
                      value={newItem.vessel}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Vessel</option>
                      {vessels.map((vessel) => (
                        <option key={vessel._id} value={vessel._id}>
                          {vessel.name}
                        </option>
                      ))}
                    </select>
                  )}
                  <select
                    name="category"
                    value={newItem.category}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Category</option>
                    {categories.map((category, index) => (
                      <option key={index} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  {(newItem.category === 'Form or Checklist' || newItem.category === 'Document') && (
                    <>
                      <select
                        name="subcategory"
                        value={newItem.subcategory}
                        onChange={handleInputChange}
                        style={{ display: newItem.category ? 'block' : 'none' }}
                      >
                        <option value="">Select Subcategory</option>
                        {subcategories.map((subcategory, index) => (
                          <option key={index} value={subcategory}>
                            {subcategory}
                          </option>
                        ))}
                      </select>
                      <select
                        name="name"
                        value={newItem.name}
                        onChange={handleInputChange}
                        style={{ display: newItem.subcategory ? 'block' : 'none' }}
                      >
                        <option value="">Select Item</option>
                        {itemOptions.map((item, index) => (
                          <option key={item._id} value={item.form_name}>
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
                        />
                      )}
                      {/* Show Date and Recurring fields only after an item is selected */}
                      {newItem.name && (
                        <>
                          <label htmlFor="dueDate">Due Date</label>
                          <input
                            type="date"
                            name="dueDate"
                            id="dueDate"
                            value={newItem.dueDate}
                            onChange={handleInputChange}
                          />
                          <div className="recurring-container">
                            <input
                              type="checkbox"
                              name="isRecurring"
                              checked={newItem.isRecurring}
                              onChange={handleInputChange}
                              id="recurring-checkbox"
                            />
                            <label htmlFor="recurring-checkbox">Recurring</label>
                          </div>
                        </>
                      )}
                      {newItem.formDefinitionId === '669edf84beec7dd7fcd9b5f0' && (
                        <>
                          <label>
                            Type:
                            <select
                              name="type"
                              value={newItem.type}
                              onChange={handleTypeChange}
                            >
                              <option value="">Select Type</option>
                              <option value="Abandon Ship (w/ em'cy lighting)">Abandon Ship (w/ em'cy lighting)</option>
                              <option value="Fire Drill">Fire Drill</option>
                              <option value="Emergency Steering">Emergency Steering</option>
                              <option value="Man Overboard">Man Overboard</option>
                              <option value="Medical Emergency">Medical Emergency</option>
                              <option value="Collision/Grounding/Flooding">Collision/Grounding/Flooding</option>
                              <option value="Power Failure">Power Failure</option>
                              <option value="Ship Oil Pollution Prevention">Ship Oil Pollution Prevention</option>
                              <option value="LSA & Fire Onboard Training">LSA & Fire Onboard Training</option>
                              <option value="Rescue Boat">Rescue Boat</option>
                              <option value="Entry & Rescue in Enclosed Space">Entry & Rescue in Enclosed Space</option>
                              <option value="Ship Security">Ship Security</option>
                              <option value="SSAS">SSAS</option>
                              <option value="Helicopter Operation">Helicopter Operation</option>
                              <option value="ISPS Ship to Shore">ISPS Ship to Shore</option>
                              <option value="ISM Ship to Shore">ISM Ship to Shore</option>
                              <option value="Other">Other</option>
                            </select>
                          </label>
                          {newItem.type === 'Other' && (
                            <input
                              type="text"
                              name="customType"
                              value={newItem.customType}
                              onChange={handleCustomTypeChange}
                              placeholder="Enter custom type"
                              maxLength="75"
                            />
                          )}
                        </>
                      )}
                      {newItem.category === 'Document' && (
                        <input
                          type="file"
                          name="attachments"
                          onChange={handleFileChange}
                          multiple
                          style={{ display: newItem.dueDate ? 'block' : 'none' }}
                        />
                      )}
                      {(role === 'Superuser' || role === 'Company User') && newItem.isRecurring && (
                        <>
                          <label>
                            Frequency:
                            <select
                              name="recurrenceFrequency"
                              value={newItem.recurrenceFrequency}
                              onChange={handleInputChange}
                            >
                              <option value="">Select Frequency</option>
                              <option value="week">Weekly</option>
                              <option value="month">Monthly</option>
                              <option value="year">Yearly</option>
                            </select>
                          </label>
                          <label>
                            Every:
                            <input
                              type="number"
                              name="recurrenceInterval"
                              value={newItem.recurrenceInterval}
                              onChange={handleInputChange}
                              min="1"
                            />
                            {newItem.recurrenceFrequency === 'week' ? 'week(s)' :
                              newItem.recurrenceFrequency === 'month' ? 'month(s)' : 'year(s)'}
                          </label>
                          <label>
                            Basis:
                            <select
                              name="recurrenceBasis"
                              value={newItem.recurrenceBasis}
                              onChange={handleInputChange}
                            >
                              <option value="initial">Initial Due Date</option>
                              <option value="completion">Completion Date</option>
                            </select>
                          </label>
                        </>
                      )}
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
                      />
                      {renderDateSelector()}
                    </>
                  )}
                  <button type="submit">Add Item</button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main content area */}
      <div className="main-content">
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
              {filteredAndSortedItems().map((item) => {
                const isCompleted = item.completed && item.pdfPath;
                const showChatForItem = showChat === item._id;
                return (
                  <React.Fragment key={item._id}>
                    <tr className={isCompleted ? 'completed-row' : ''}>
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
                      <td>
                        {isCompleted ? (
                          'Completed'
                        ) : (
                          item.dueDate ? formatDate(item.dueDate) : ''
                        )}
                      </td>
                      <td>
                        {item.isRecurring ? `Every ${item.recurrenceInterval} ${item.recurrenceFrequency}(s) by ${item.recurrenceBasis}` : 'No'}
                      </td>
                      <td>
                        {item.updatedAt ? formatDateTime(item.updatedAt) : 'N/A'}
                      </td>
                      <td>
                        {item.category === 'Form or Checklist' ? (
                          item.completed ? (
                            item.pdfPath ? (
                              <a href={`http://localhost:5001${item.pdfPath}`} target="_blank" rel="noopener noreferrer">
                                <FontAwesomeIcon icon={faPaperclip} />
                              </a>
                            ) : (
                              ''
                            )
                          ) : (
                            ''
                          )
                        ) : item.attachments.length > 0 ? (
                          item.attachments.map((attachment, index) => (
                            <a key={index} href={`http://localhost:5001/uploads/${attachment}`} target="_blank" rel="noopener noreferrer">
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
                          style={{ color: showChatForItem ? 'black' : unreadComments[item._id] ? 'orange' : '#3eb4e4' }}
                        >
                          <FontAwesomeIcon icon={faComments} />
                        </button>
                        {!item.completed && item.category === 'Form or Checklist' && (
                          <button className="action-icon" onClick={() => handleCompleteForm(item.formDefinitionId)}>
                            <FontAwesomeIcon icon={faEdit} style={{ color: 'orange' }} />
                          </button>
                        )}
                      </td>
                    </tr>
                    {showChatForItem && (
                      <tr key={`chat-${item._id}`} className="chat-row">
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
