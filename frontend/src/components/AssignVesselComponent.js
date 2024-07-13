import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AssignVesselComponent = () => {
  const [users, setUsers] = useState([]);
  const [vessels, setVessels] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedVessels, setSelectedVessels] = useState([]);

  useEffect(() => {
    fetchUsers();
    fetchVessels();
  }, []);

  const fetchUsers = async () => {
    const token = localStorage.getItem('authToken');
    const response = await axios.get('http://localhost:5001/api/users', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    setUsers(response.data);
  };

  const fetchVessels = async () => {
    const token = localStorage.getItem('authToken');
    const response = await axios.get('http://localhost:5001/api/vessels', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    setVessels(response.data);
  };

  const handleAssign = async () => {
    const token = localStorage.getItem('authToken');
    await axios.put(`http://localhost:5001/api/users/${selectedUser}/vessels`, {
      vessels: selectedVessels,
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    alert('Vessels assigned successfully');
  };

  return (
    <div>
      <h1>Assign Vessels to Users</h1>
      <select onChange={(e) => setSelectedUser(e.target.value)}>
        <option value="">Select User</option>
        {users.map((user) => (
          <option key={user._id} value={user._id}>
            {user.username}
          </option>
        ))}
      </select>
      <select multiple onChange={(e) => setSelectedVessels(Array.from(e.target.selectedOptions, option => option.value))}>
        <option value="">Select Vessels</option>
        {vessels.map((vessel) => (
          <option key={vessel._id} value={vessel._id}>
            {vessel.name}
          </option>
        ))}
      </select>
      <button onClick={handleAssign}>Assign Vessels</button>
    </div>
  );
};

export default AssignVesselComponent;
