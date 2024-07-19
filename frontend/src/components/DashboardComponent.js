import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import ChatComponent from './ChatComponent';
import './DashboardComponent.css';
import data from './formData';
import formMappings from '../data/formMappings';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faComments, faEdit, faPaperclip } from '@fortawesome/free-solid-svg-icons';

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
    role: ''  // Ensure role is part of the state
  });
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
  const [searchQuery, setSearchQuery] = useState('');
  const history = useHistory();

  const fetchItems = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('http://localhost:5001/api/items', {
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

      console.log('User:', user);
      console.log('All Vessels:', response.data);

      let userVessels;
      if (user.role === 'Superuser') {
        userVessels = response.data;
      } else {
        userVessels = response.data.filter(vessel => user.assignedVessels.includes(vessel._id));
      }

      console.log('User Vessels:', userVessels);
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
      console.log('User Role:', response.data.role);
    } catch (error) {
      setError('Error fetching user role');
    }
  };

  useEffect(() => {
    fetchItems();
    fetchVessels();
    fetchUserRole();
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
    const { name, value } = e.target;
    setNewItem((prevItem) => ({
      ...prevItem,
      [name]: value,
    }));

    if (name === 'category') {
      const selectedCategory = data.categories.find((cat) => cat.name === value);
      setSubcategories(data.subCategories.filter((sub) => sub.categoryId === selectedCategory?.id));
      setItemOptions([]);
      setNewItem((prevItem) => ({
        ...prevItem,
        subcategory: '',
        name: '',
        customName: '',  // Reset custom name
      }));
    } else if (name === 'subcategory') {
      const selectedSubcategory = data.subCategories.find((sub) => sub.name === value);
      setItemOptions(data.items.filter((item) => item.subCategoryId === selectedSubcategory?.id));
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setNewItem((prevItem) => ({
      ...prevItem,
      attachments: files,
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

      // Add fields to formData
      formData.append('category', newItem.category);
      formData.append('dueDate', newItem.dueDate);
      formData.append('vessel', newItem.vessel);
      formData.append('role', newItem.role);  // Include role

      // Conditionally add fields based on category
      if (newItem.category === 'Form or Checklist' || newItem.category === 'Document') {
        const itemName = newItem.name === 'custom' ? newItem.customName : newItem.name;
        formData.append('name', itemName);
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
        customName: '',  // Reset custom name
        role: newItem.role  // Retain role
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
    if (dueDate < currentDate) {
      return 'red';
    } else if (dueDate < new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000)) {
      return 'orange';
    } else {
      return 'green';
    }
  };

  const handleCompleteForm = (item) => {
    const selectedItem = data.items.find((dataItem) => dataItem.name === item.name);
    if (!selectedItem) return;
    const formType = formMappings[selectedItem.id];
    if (!formType) return;
    history.push(`/form/${formType}/${item._id}`);
  };

  const filteredAndSortedItems = () => {
    let filteredItems = items;

    // Filter by search query
    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      filteredItems = filteredItems.filter(item => {
        const nameMatch = (item.name || '').toLowerCase().includes(lowercasedQuery);
        const titleMatch = (item.title || '').toLowerCase().includes(lowercasedQuery);
        const categoryMatch = (item.category || '').toLowerCase().includes(lowercasedQuery);
        const subcategoryMatch = (item.subcategory || '').toLowerCase().includes(lowercasedQuery);
        const vesselMatch = (item.vessel && item.vessel.name.toLowerCase().includes(lowercasedQuery)) || false;
        return nameMatch || titleMatch || categoryMatch || subcategoryMatch || vesselMatch;
      });
    }

    // Filter by category
    if (filterCategory) {
      filteredItems = filteredItems.filter(item => item.category === filterCategory);
    }

    // Filter by subcategory
    if (filterSubcategory) {
      filteredItems = filteredItems.filter(item => item.subcategory === filterSubcategory);
    }

    // Filter by item
    if (filterItem) {
      filteredItems = filteredItems.filter(item => item.name === filterItem);
    }

    // Filter by vessel
    if (selectedVessel) {
      filteredItems = filteredItems.filter(item => item.vessel && item.vessel._id === selectedVessel);
    }

    // Filter by completion status
    if (completedFilter === 'Completed') {
      filteredItems = filteredItems.filter(item => item.completed);
    } else if (completedFilter === 'Outstanding') {
      filteredItems = filteredItems.filter(item => !item.completed);
    }

    // Sort items
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
      const selectedCategoryData = data.categories.find((cat) => cat.name === selectedCategory);
      setSubcategories(data.subCategories.filter((sub) => sub.categoryId === selectedCategoryData?.id));
    } else {
      setSubcategories([]);
    }
  };

  const handleFilterSubcategoryChange = (e) => {
    setFilterSubcategory(e.target.value);
    setFilterItem('');
    if (e.target.value) {
      const selectedSubcategoryData = data.subCategories.find((sub) => sub.name === e.target.value);
      setItemOptions(data.items.filter((item) => item.subCategoryId === selectedSubcategoryData?.id));
    } else {
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

  const getAvailableCategories = () => {
    const categories = data.categories.map(cat => cat.name);
    return Array.from(new Set(categories));
  };

  const getAvailableSubcategories = () => {
    if (!filterCategory) return [];
    const selectedCategoryData = data.categories.find((cat) => cat.name === filterCategory);
    const subcategories = data.subCategories.filter((sub) => sub.categoryId === selectedCategoryData?.id).map((sub) => sub.name);
    return Array.from(new Set(subcategories));
  };

  const getAvailableItems = () => {
    if (!filterSubcategory) return [];
    const selectedSubcategoryData = data.subCategories.find((sub) => sub.name === filterSubcategory);
    const items = data.items.filter((item) => item.subCategoryId === selectedSubcategoryData?.id).map((item) => item.name);
    return Array.from(new Set(items));
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-header">Dashboard</h1>
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
      <div className="button-and-form">
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
              {data.categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
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
                  {subcategories.map((subcategory) => (
                    <option key={subcategory.id} value={subcategory.name}>
                      {subcategory.name}
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
                  {itemOptions.map((item) => (
                    <option key={item.id} value={item.name}>
                      {item.name}
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
                <input
                  type="date"
                  name="dueDate"
                  value={newItem.dueDate}
                  onChange={handleInputChange}
                  style={{ display: newItem.name || newItem.customName ? 'block' : 'none' }}
                />
                {newItem.category === 'Document' && (
                  <input
                    type="file"
                    name="attachments"
                    onChange={handleFileChange}
                    multiple
                    style={{ display: newItem.dueDate ? 'block' : 'none' }}
                  />
                )}
                {newItem.category === 'Form or Checklist' && role !== 'Superuser' && role !== 'Company User' && (
                  <div style={{ display: newItem.name || newItem.customName ? 'block' : 'none' }}>
                    <label>
                      <input
                        type="radio"
                        name="completeNow"
                        value="now"
                        checked={newItem.completeNow === 'now'}
                        onChange={handleInputChange}
                      />
                      Complete Form or Checklist Now
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="completeNow"
                        value="later"
                        checked={newItem.completeNow === 'later'}
                        onChange={handleInputChange}
                      />
                      Choose a Date
                    </label>
                    {newItem.completeNow === 'later' && (
                      <input
                        type="date"
                        name="dueDate"
                        value={newItem.dueDate}
                        onChange={handleInputChange}
                      />
                    )}
                  </div>
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
                <input
                  type="date"
                  name="dueDate"
                  value={newItem.dueDate}
                  onChange={handleInputChange}
                />
              </>
            )}
            <button type="submit">Add Item</button>
          </form>
        )}
      </div>

      <div className="filters">
  <input
    type="text"
    placeholder="Search"
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
  />
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
    {getAvailableCategories().map((category, index) => (
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
    {getAvailableSubcategories().map((subcategory, index) => (
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
    {getAvailableItems().map((item, index) => (
      <option key={index} value={item}>
        {item}
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
</div>

      <table>
        <thead>
          <tr>
            {(role === 'Company User' || role === 'Superuser') && (
              <th>
                <button type="button" onClick={() => requestSort('vessel')}>
                  Vessel {sortConfig.key === 'vessel' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </button>
              </th>
            )}
            <th>
              <button type="button" onClick={() => requestSort('name')}>
                Item {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </button>
            </th>
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
              <button type="button" onClick={() => requestSort('dueDate')}>
                Due/Expiry Date {sortConfig.key === 'dueDate' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </button>
            </th>
            <th>Status</th>
            <th>
              <FontAwesomeIcon icon={faPaperclip} />
            </th>
            <th>
              <button type="button" onClick={() => requestSort('submitted')}>
                Submitted {sortConfig.key === 'submitted' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </button>
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
                  {(role === 'Company User' || role === 'Superuser') && <td>{item.vessel ? item.vessel.name : 'N/A'}</td>}
                  <td>{item.name || item.title}</td>
                  <td>{item.category}</td>
                  <td>{item.subcategory || 'N/A'}</td>
                  <td>
                    {isCompleted ? (
                      'Completed'
                    ) : (
                      item.dueDate ? formatDate(item.dueDate) : ''
                    )}
                  </td>
                  <td>
                    <span
                      className="status-dot"
                      style={{ backgroundColor: calculateStatusColor(item) }}
                    ></span>
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
                    {item.updatedAt ? formatDateTime(item.updatedAt) : 'N/A'}
                  </td>
                  <td>
                    <button onClick={() => handleDelete(item._id)}>
                      <FontAwesomeIcon icon={faTrashAlt} />
                    </button>
                    <button
                      onClick={() => handleToggleChat(item._id)}
                      style={{ color: showChatForItem ? 'black' : unreadComments[item._id] ? 'red' : 'white' }}
                    >
                      <FontAwesomeIcon icon={faComments} />
                    </button>
                    {!item.completed && item.category === 'Form or Checklist' && (
                      <button onClick={() => handleCompleteForm(item)}>
                        <FontAwesomeIcon icon={faEdit} style={{ color: 'orange' }} />
                      </button>
                    )}
                  </td>
                </tr>
                {showChatForItem && (
                  <tr key={`chat-${item._id}`} className="chat-row">
                    <td colSpan="9">
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
  );
}

export default DashboardComponent;
