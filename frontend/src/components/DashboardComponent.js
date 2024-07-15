import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import './DashboardComponent.css';
import data from './formData';
import formMappings from '../data/formMappings';

function DashboardComponent({ setToken }) {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({
    name: '',
    category: '',
    subcategory: '',
    dueDate: '',
    attachments: [],
    title: '',
    details: '',
    vessel: ''
  });
  const [subcategories, setSubcategories] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [filterCategory, setFilterCategory] = useState('');
  const [filterSubcategory, setFilterSubcategory] = useState('');
  const [vessels, setVessels] = useState([]);
  const [selectedVessel, setSelectedVessel] = useState('');
  const [role, setRole] = useState('');
  const [showCompleted, setShowCompleted] = useState(true); // State for toggle filter
  const history = useHistory();

  const fetchItems = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('http://localhost:5001/api/items', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Fetched items:', response.data);
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching items:', error.response ? error.response.data : error.message);
      setError('Error fetching items');
    }
  };

  const fetchVessels = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('http://localhost:5001/api/vessels', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Fetched vessels:', response.data);
      setVessels(response.data);
    } catch (error) {
      console.error('Error fetching vessels:', error.response ? error.response.data : error.message);
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
      console.log('Fetched user role:', response.data.role);
      setRole(response.data.role);
    } catch (error) {
      console.error('Error fetching user role:', error.response ? error.response.data : error.message);
      setError('Error fetching user role');
    }
  };

  useEffect(() => {
    fetchItems();
    fetchVessels();
    fetchUserRole();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem((prevItem) => ({
      ...prevItem,
      [name]: value,
    }));

    if (name === 'category') {
      if (value === 'Track a Date') {
        setSubcategories([]);
        setItemOptions([]);
        setNewItem((prevItem) => ({
          ...prevItem,
          subcategory: '',
          name: '',
        }));
      } else {
        const selectedCategory = data.categories.find((cat) => cat.name === value);
        setSubcategories(data.subCategories.filter((sub) => sub.categoryId === selectedCategory?.id));
        setItemOptions([]);
        setNewItem((prevItem) => ({
          ...prevItem,
          subcategory: '',
          name: '',
        }));
      }
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
    if (newItem.category !== 'Track a Date' && !newItem.subcategory) errors.push('Subcategory is required');
    if (newItem.category !== 'Track a Date' && !newItem.name) errors.push('Item name is required');
    if (newItem.category === 'Track a Date' && !newItem.title) errors.push('Title is required');
    if (!newItem.dueDate) errors.push('Due date is required');
    if (newItem.category !== 'Track a Date' && !newItem.vessel) errors.push('Vessel is required');
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
      Object.keys(newItem).forEach((key) => {
        if (key === 'attachments') {
          newItem.attachments.forEach((file) => {
            formData.append('attachments', file);
          });
        } else {
          formData.append(key, newItem[key]);
        }
      });

      const response = await axios.post('http://localhost:5001/api/items', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Item added successfully:', response.data);
      setItems([...items, response.data]);
      setNewItem({
        name: '',
        category: '',
        subcategory: '',
        dueDate: '',
        attachments: [],
        title: '',
        details: '',
        vessel: ''
      });
      setShowForm(false);
      fetchItems();  // Re-fetch items after form submission
      setValidationErrors([]);  // Clear validation errors
    } catch (error) {
      console.error('Error adding item:', error.response ? error.response.data : error.message);
      setError('Error adding item');
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
      console.log('Item deleted successfully:', id);
      setItems(items.filter((item) => item._id !== id));
    } catch (error) {
      console.error('Error deleting item:', error.response ? error.response.data : error.message);
      setError('Error deleting item');
    }
  };

  const calculateStatusColor = (item) => {
    if (item.completed && item.pdfPath) {
      return 'blue'; // Color for completed forms with attachments
    }
    // Existing logic for calculating status color based on due date
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
    console.log('Complete Form clicked for item:', item);

    const selectedItem = data.items.find((dataItem) => dataItem.name === item.name);

    if (!selectedItem) {
      console.error('No item found for item name:', item.name);
      return;
    }

    const formType = formMappings[selectedItem.id];

    if (!formType) {
      console.error('No form type found for item ID:', selectedItem.id);
      return;
    }

    console.log('Mapped form type:', formType);

    history.push(`/form/${formType}/${item._id}`);
  };

  const sortedItems = () => {
    let filteredItems = items;
    if (filterCategory) {
      filteredItems = filteredItems.filter(item => item.category === filterCategory);
    }
    if (filterSubcategory) {
      filteredItems = filteredItems.filter(item => item.subcategory === filterSubcategory);
    }
    if ((role === 'Company User' || role === 'Superuser') && selectedVessel) {
      filteredItems = filteredItems.filter(item => item.vessel && item.vessel._id === selectedVessel);
    }
    if (!showCompleted) {
      filteredItems = filteredItems.filter(item => !(item.completed && item.pdfPath));
    }
    if (!sortConfig.key) return filteredItems;
    return [...filteredItems].sort((a, b) => {
      const aValue = sortConfig.key === 'submitted' ? new Date(a.updatedAt) : a[sortConfig.key] || '';
      const bValue = sortConfig.key === 'submitted' ? new Date(b.updatedAt) : b[sortConfig.key] || '';
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

  useEffect(() => {
    fetchItems(); // Fetch items again when returning to the dashboard
  }, [history.location.pathname]);

  const handleFilterCategoryChange = (e) => {
    const selectedCategory = e.target.value;
    setFilterCategory(selectedCategory);
    setFilterSubcategory(''); // Reset subcategory filter when category changes
    if (selectedCategory) {
      const selectedCategoryData = data.categories.find((cat) => cat.name === selectedCategory);
      setSubcategories(data.subCategories.filter((sub) => sub.categoryId === selectedCategoryData?.id));
    } else {
      setSubcategories([]);
    }
  };

  const handleFilterSubcategoryChange = (e) => {
    setFilterSubcategory(e.target.value);
  };

  const handleClearFilters = () => {
    setFilterCategory('');
    setFilterSubcategory('');
    setSelectedVessel('');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    return date.toLocaleString('en-GB', options).replace(',', '');
  };

  const getAvailableCategories = () => {
    const categories = items.map(item => item.category);
    return Array.from(new Set(categories));
  };

  const getAvailableSubcategories = () => {
    if (!filterCategory) return [];
    const subcategories = items
      .filter(item => item.category === filterCategory)
      .map(item => item.subcategory);
    return Array.from(new Set(subcategories));
  };

  const getAvailableVessels = () => {
    const vesselIds = items.map(item => item.vessel && item.vessel._id).filter(id => id);
    return vessels.filter(vessel => vesselIds.includes(vessel._id));
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
      <button onClick={() => setShowForm(!showForm)}>
        {showForm ? 'Hide Form' : 'Add New Item'}
      </button>
      {showForm && (
        <form onSubmit={handleSubmit} className="new-item-form">
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
          {newItem.category !== 'Track a Date' && (
            <>
              <select
                name="subcategory"
                value={newItem.subcategory}
                onChange={handleInputChange}
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
              >
                <option value="">Select Item</option>
                {itemOptions.map((item) => (
                  <option key={item.id} value={item.name}>
                    {item.name}
                  </option>
                ))}
                <option value="new">Add New Item</option>
              </select>
              {newItem.name === 'new' && (
                <input
                  type="text"
                  name="name"
                  value={newItem.name}
                  onChange={handleInputChange}
                  placeholder="New Item Name"
                />
              )}
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
              <textarea
                name="details"
                value={newItem.details}
                onChange={handleInputChange}
                placeholder="Details"
              ></textarea>
            </>
          )}
          <input
            type="date"
            name="dueDate"
            value={newItem.dueDate}
            onChange={handleInputChange}
          />
          {newItem.category !== 'Track a Date' && (
            <input
              type="file"
              name="attachments"
              onChange={handleFileChange}
              multiple
            />
          )}
          <button type="submit">Add Item</button>
        </form>
      )}
      <div className="filters">
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
        {(role === 'Company User' || role === 'Superuser') && (
          <select
            name="filterVessel"
            value={selectedVessel}
            onChange={(e) => setSelectedVessel(e.target.value)}
          >
            <option value="">Filter by Vessel</option>
            {getAvailableVessels().map((vessel) => (
              <option key={vessel._id} value={vessel._id}>
                {vessel.name}
              </option>
            ))}
          </select>
        )}
        <label>
          <input
            type="checkbox"
            checked={showCompleted}
            onChange={() => setShowCompleted(!showCompleted)}
          />
          Show Completed
        </label>
        <button onClick={handleClearFilters}>Clear Filters</button>
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
            <th>Details</th>
            <th>
              <button type="button" onClick={() => requestSort('submitted')}>
                Submitted {sortConfig.key === 'submitted' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </button>
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedItems().map((item) => {
            const isCompleted = item.completed && item.pdfPath;
            return (
              <tr key={item._id} className={isCompleted ? 'completed-row' : ''}>
                {(role === 'Company User' || role === 'Superuser') && <td>{item.vessel ? item.vessel.name : 'N/A'}</td>}
                <td>{item.name || item.title}</td>
                <td>{item.category}</td>
                <td>{item.subcategory || 'N/A'}</td>
                <td>
                  {isCompleted ? (
                    'Completed'
                  ) : (
                    item.dueDate ? item.dueDate.split('T')[0] : 'N/A'
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
                          See Attachment
                        </a>
                      ) : (
                        'No attachment found'
                      )
                    ) : (
                      <button onClick={() => handleCompleteForm(item)}>
                        Complete Form
                      </button>
                    )
                  ) : item.attachments.length > 0 ? (
                    item.attachments.map((attachment, index) => (
                      <a key={index} href={`http://localhost:5001/uploads/${attachment}`} target="_blank" rel="noopener noreferrer">
                        View Attachment
                      </a>
                    ))
                  ) : (
                    'N/A'
                  )}
                </td>
                <td>{item.updatedAt ? formatDate(item.updatedAt) : 'N/A'}</td>
                <td>
                  <button onClick={() => handleDelete(item._id)}>Delete</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default DashboardComponent;
