import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function TableComponent() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/items');
        setItems(response.data);
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    };
    fetchItems();
  }, []);

  const filteredItems = items.filter(item => {
    if (filter === 'all') return true;
    return item.type === filter;
  });

  return (
    <div>
      <h2>Items</h2>
      <div>
        <label>Filter:</label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="date">Dates</option>
          <option value="document">Documents</option>
          <option value="form">Forms</option>
        </select>
      </div>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Link</th>
          </tr>
        </thead>
        <tbody>
          {filteredItems.map(item => (
            <tr key={item._id}>
              <td>{item.name}</td>
              <td>{item.type}</td>
              <td>
                {item.type === 'document' ? (
                  <>
                    <Link to={`/documents/${item._id}`}>View Document</Link>
                    <Link to={`/chats/${item._id}`} style={{ marginLeft: '10px' }}>Chat</Link>
                  </>
                ) : (
                  <a href={item.link} target="_blank" rel="noopener noreferrer">Open</a>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TableComponent;
