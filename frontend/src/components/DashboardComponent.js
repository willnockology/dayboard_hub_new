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
    details: ''
  });
  const [subcategories, setSubcategories] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
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

  useEffect(() => {
    fetchItems();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setToken(null);
    history.push('/login');
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        details: ''
      });
      setShowForm(false);
      fetchItems();  // Re-fetch items after form submission
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

  const calculateStatusColor = (dueDate) => {
    if (!dueDate) return 'gray';
    const due = new Date(dueDate);
    const now = new Date();
    if (due < now) return 'red';
    const diffTime = Math.abs(due - now);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 7) return 'orange';
    return 'green';
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

  useEffect(() => {
    fetchItems(); // Fetch items again when returning to the dashboard
  }, [history.location.pathname]);

  return (
    <div>
      <h1>Dashboard</h1>
      {error && <p>{error}</p>}
      <button onClick={() => setShowForm(!showForm)}>
        {showForm ? 'Hide Form' : 'Add New Item'}
      </button>
      <button onClick={handleLogout}>Logout</button>
      {showForm && (
        <form onSubmit={handleSubmit}>
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
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Category</th>
            <th>Subcategory</th>
            <th>Due/Expiry Date</th>
            <th>Status</th>
            <th>Details</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item._id}>
              <td>{item.name || item.title}</td>
              <td>{item.category}</td>
              <td>{item.subcategory || 'N/A'}</td>
              <td>{item.dueDate ? item.dueDate.split('T')[0] : 'N/A'}</td>
              <td>
                <span
                  className="status-dot"
                  style={{ backgroundColor: calculateStatusColor(item.dueDate) }}
                ></span>
              </td>
              <td>
                {item.category === 'Form or Checklist' ? (
                  item.completed ? (
                    item.pdfPath && (
                      <a href={`http://localhost:5001${item.pdfPath}`} target="_blank" rel="noopener noreferrer">
                        See Attachment
                      </a>
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
              <td>
                <button onClick={() => handleDelete(item._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DashboardComponent;
