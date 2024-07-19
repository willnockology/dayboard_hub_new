import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ProfileComponent.css';

const ProfileComponent = () => {
  const [profile, setProfile] = useState({});
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phoneNumber: '',
    birthday: '',
    startDate: '',
    position: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get('http://localhost:5001/api/users/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProfile(response.data);
        setFormData({
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          username: response.data.username,
          email: response.data.email,
          phoneNumber: response.data.phoneNumber || '',
          birthday: response.data.birthday ? response.data.birthday.split('T')[0] : '',
          startDate: response.data.startDate ? response.data.startDate.split('T')[0] : '',
          position: response.data.position || '',
          password: '',
          confirmPassword: ''
        });
      } catch (error) {
        console.error('Error fetching profile:', error.response ? error.response.data : error.message);
        setError('Error fetching profile');
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      await axios.put('http://localhost:5001/api/users/profile', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        birthday: formData.birthday,
        startDate: formData.startDate,
        position: formData.position,
        password: formData.password
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProfile({
        ...profile,
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        birthday: formData.birthday,
        startDate: formData.startDate,
        position: formData.position
      });

      setIsEditing(false);
      setError('');
    } catch (error) {
      console.error('Error updating profile:', error.response ? error.response.data : error.message);
      setError('Error updating profile');
    }
  };

  return (
    <div className="profile-container">
      <h2>Profile</h2>
      {error && <p className="error-message">{error}</p>}
      {!isEditing ? (
        <div className="profile-details">
          <p><strong>First Name:</strong> {profile.firstName}</p>
          <p><strong>Last Name:</strong> {profile.lastName}</p>
          <p><strong>Username:</strong> {profile.username}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Phone Number:</strong> {profile.phoneNumber}</p>
          <p><strong>Birthday:</strong> {profile.birthday && new Date(profile.birthday).toLocaleDateString()}</p>
          <p><strong>Start Date:</strong> {profile.startDate && new Date(profile.startDate).toLocaleDateString()}</p>
          <p><strong>Position:</strong> {profile.position}</p>
          <button onClick={() => setIsEditing(true)}>Edit Profile</button>
        </div>
      ) : (
        <form onSubmit={handleFormSubmit} className="profile-form">
          <div className="form-group">
            <label>First Name:</label>
            <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label>Last Name:</label>
            <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label>Username:</label>
            <input type="text" name="username" value={formData.username} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label>Email:</label>
            <input type="email" name="email" value={formData.email} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label>Phone Number:</label>
            <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label>Birthday:</label>
            <input type="date" name="birthday" value={formData.birthday} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label>Start Date:</label>
            <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label>Position:</label>
            <input type="text" name="position" value={formData.position} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input type="password" name="password" value={formData.password} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label>Confirm Password:</label>
            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} />
          </div>
          <button type="submit">Save Changes</button>
          <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
        </form>
      )}
    </div>
  );
};

export default ProfileComponent;
