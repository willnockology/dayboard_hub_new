import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserManagementComponent = () => {
  const [users, setUsers] = useState([]);
  const [vessels, setVessels] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
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

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setSelectedVessels(user.assignedVessels.map(vessel => vessel._id));
  };

  const handleVesselChange = (e) => {
    const vesselId = e.target.value;
    const isChecked = e.target.checked;

    setSelectedVessels((prevVessels) => {
      if (isChecked) {
        return [...prevVessels, vesselId];
      } else {
        return prevVessels.filter(id => id !== vesselId);
      }
    });
  };

  const handleSave = async () => {
    const token = localStorage.getItem('authToken');
    await axios.put(`http://localhost:5001/api/users/${selectedUser._id}/vessels`, {
      vessels: selectedVessels,
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    alert('Vessels assigned successfully');
    fetchUsers();
  };

  return (
    <div>
      <h1>User Management</h1>
      <table>
        <thead>
          <tr>
            <th>Username</th>
            <th>Role</th>
            <th>Email</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Assigned Vessels</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>{user.username}</td>
              <td>{user.role}</td>
              <td>{user.email}</td>
              <td>{user.firstName}</td>
              <td>{user.lastName}</td>
              <td>
                {user.role === 'Superuser' ? (
                  vessels.map(vessel => vessel.name).join(', ')
                ) : (
                  user.assignedVessels.map(vessel => vessel.name).join(', ')
                )}
              </td>
              <td>
                <button
                  onClick={() => handleUserSelect(user)}
                  disabled={user.role === 'Superuser'}
                >
                  {user.role === 'Superuser' ? 'Assigned to all vessels' : 'Assign Vessels'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {selectedUser && selectedUser.role !== 'Superuser' && (
        <div>
          <h2>Assign Vessels to {selectedUser.username}</h2>
          <ul>
            {vessels.map((vessel) => (
              <li key={vessel._id}>
                <label>
                  <input
                    type="checkbox"
                    value={vessel._id}
                    checked={selectedVessels.includes(vessel._id)}
                    onChange={handleVesselChange}
                  />
                  {vessel.name}
                </label>
              </li>
            ))}
          </ul>
          <button onClick={handleSave}>Save</button>
        </div>
      )}
    </div>
  );
};

export default UserManagementComponent;
