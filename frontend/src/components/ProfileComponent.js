// frontend/src/components/ProfileComponent.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ProfileComponent = () => {
  const [profile, setProfile] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('authToken');
        console.log('Fetching profile with token:', token); // Debugging log
        const response = await axios.get('http://localhost:5001/api/users/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log('Profile response received:', response); // Debugging log
        setProfile(response.data);
      } catch (error) {
        console.error('Error fetching profile:', error.response ? error.response.data : error.message);
        setError('Error fetching profile');
      }
    };

    fetchProfile();
  }, []);

  return (
    <div>
      <h2>Profile</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <p>Username: {profile.username}</p>
      <p>Email: {profile.email}</p>
      <p>Role: {profile.role}</p>
    </div>
  );
};

export default ProfileComponent;
