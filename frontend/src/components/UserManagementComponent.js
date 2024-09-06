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
  const [formType, setFormType] = useState(''); // 'add' or 'update'
  const [message, setMessage] = useState('');

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

  const handleUserSelect = (e) => {
    const userId = e.target.value;
    const user = users.find((u) => u._id === userId);
    if (user) {
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
      setFormType('update');
    } else {
      setSelectedUser(null);
      setSelectedVessels([]);
      setIsCommercial(false);
      setUserDetails({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        position: '',
        nationality: '',
        passportNumber: '',
        photo: null,
      });
      setFormType('add');
    }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      if (formType === 'update') {
        await axios.put(`http://localhost:5001/api/users/${selectedUser._id}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        setMessage('User updated successfully');
      } else {
        await axios.post('http://localhost:5001/api/users', formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        setMessage('User added successfully');
      }
      fetchUsers();
      setFormType('');
      setSelectedUser(null);
      setUserDetails({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        position: '',
        nationality: '',
        passportNumber: '',
        photo: null,
      });
      setSelectedVessels([]);
      setIsCommercial(false);
    } catch (error) {
      console.error('Error submitting user data:', error);
      setMessage('Error submitting user data');
    }
  };

  return (
    <div>
      <h1>User Management</h1>
      <button 
        onClick={() => {
          setFormType('add');
          setUserDetails({
            firstName: '',
            lastName: '',
            email: '',
            phoneNumber: '',
            position: '',
            nationality: '',
            passportNumber: '',
            photo: null,
          });
        }}
        style={{ marginRight: '5px' }}
        >
          Add New User
      </button>
      <button 
        onClick={() => setFormType('update')}
        style={{ marginLeft: '5px', marginRight: '5px' }}
        >
          Update Existing User
      </button>
      {formType === 'update' && (
        <select onChange={handleUserSelect} value={selectedUser?._id || ''}>
          <option value="">Select a user to update</option>
          {users.map((user) => (
            <option key={user._id} value={user._id}>
              {user.username}
            </option>
          ))}
        </select>
      )}
      {(formType === 'add' || (formType === 'update' && selectedUser)) && (
        <div>
          <form onSubmit={handleSubmit}>
            <label>
              First Name
              <input
                type="text"
                name="firstName"
                value={userDetails.firstName}
                onChange={handleInputChange}
                required
              />
            </label>
            <label>
              Last Name
              <input
                type="text"
                name="lastName"
                value={userDetails.lastName}
                onChange={handleInputChange}
                required
              />
            </label>
            <label>
              Email
              <input
                type="email"
                name="email"
                value={userDetails.email}
                onChange={handleInputChange}
                required
              />
            </label>
            <label>
              Phone Number
              <input
                type="tel"
                name="phoneNumber"
                value={userDetails.phoneNumber}
                onChange={handleInputChange}
                required
              />
            </label>
            <label>
              Position
              <input
                type="text"
                name="position"
                value={userDetails.position}
                onChange={handleInputChange}
                required
              />
            </label>
            <label>
              Nationality
              <input
                type="text"
                name="nationality"
                value={userDetails.nationality}
                onChange={handleInputChange}
                required
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
            <button type="submit">{formType === 'add' ? 'Add User' : 'Update User'}</button>
          </form>
          {message && <p>{message}</p>}
        </div>
      )}
    </div>
  );
};

export default UserManagementComponent;
