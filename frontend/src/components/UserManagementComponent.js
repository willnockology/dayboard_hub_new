import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserManagementComponent = () => {
  const [users, setUsers] = useState([]);
  const [vessels, setVessels] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedVessels, setSelectedVessels] = useState([]);
  const [isCommercial, setIsCommercial] = useState(false);
  const [userDetails, setUserDetails] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    position: '',
    nationality: '',
    passportNumber: '',
    photo: null,
  });

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
    setIsCommercial(user.commercial);
    setUserDetails({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      position: user.position,
      nationality: user.nationality,
      passportNumber: user.passportNumber,
      photo: user.photo,
    });
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

  const handleCommercialChange = (e) => {
    setIsCommercial(e.target.checked);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setUserDetails((prevDetails) => ({
      ...prevDetails,
      photo: e.target.files[0], // Handling file input
    }));
  };

  const handleSave = async () => {
    const token = localStorage.getItem('authToken');
    const formData = new FormData();
    formData.append('firstName', userDetails.firstName);
    formData.append('lastName', userDetails.lastName);
    formData.append('email', userDetails.email);
    formData.append('phoneNumber', userDetails.phoneNumber);
    formData.append('position', userDetails.position);
    formData.append('nationality', userDetails.nationality);
    formData.append('passportNumber', userDetails.passportNumber);
    formData.append('commercial', isCommercial);
    formData.append('vessels', JSON.stringify(selectedVessels));

    if (userDetails.photo) {
      formData.append('photo', userDetails.photo);
    }

    try {
      await axios.put(`http://localhost:5001/api/users/${selectedUser._id}/update`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('User updated successfully');
      fetchUsers(); // Refresh the list after saving
    } catch (error) {
      console.error('Error updating user:', error);
    }
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
            <th>Commercial</th>
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
              <td>{user.commercial ? 'Yes' : 'No'}</td>
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
                  {user.role === 'Superuser' ? 'Assigned to all vessels' : 'Edit User'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {selectedUser && selectedUser.role !== 'Superuser' && (
        <div>
          <h2>Edit {selectedUser.username}</h2>
          <label>
            First Name
            <input
              type="text"
              name="firstName"
              value={userDetails.firstName}
              onChange={handleInputChange}
            />
          </label>
          <label>
            Last Name
            <input
              type="text"
              name="lastName"
              value={userDetails.lastName}
              onChange={handleInputChange}
            />
          </label>
          <label>
            Email
            <input
              type="email"
              name="email"
              value={userDetails.email}
              onChange={handleInputChange}
            />
          </label>
          <label>
            Phone Number
            <input
              type="tel"
              name="phoneNumber"
              value={userDetails.phoneNumber}
              onChange={handleInputChange}
            />
          </label>
          <label>
            Position
            <input
              type="text"
              name="position"
              value={userDetails.position}
              onChange={handleInputChange}
            />
          </label>
          <label>
            Nationality
            <input
              type="text"
              name="nationality"
              value={userDetails.nationality}
              onChange={handleInputChange}
            />
          </label>
          <label>
            Passport Number
            <input
              type="text"
              name="passportNumber"
              value={userDetails.passportNumber}
              onChange={handleInputChange}
            />
          </label>
          <label>
            Profile Image
            <input
              type="file"
              name="photo"
              onChange={handleFileChange}
            />
          </label>
          <label>
            <input
              type="checkbox"
              checked={isCommercial}
              onChange={handleCommercialChange}
            />
            Commercial
          </label>
          <h3>Assign Vessels</h3>
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
