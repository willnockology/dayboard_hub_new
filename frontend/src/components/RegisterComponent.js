import React, { useState } from 'react';
import axios from 'axios';

const RegisterComponent = ({ setToken }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Superuser'); // Default to 'Superuser'
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = {
      firstName,
      lastName,
      username,
      password,
      role,
      email,
    };

    console.log('Form Data:', formData); // Debugging log

    try {
      await axios.post('http://localhost:5001/api/users/register', formData);
      
      setSuccess('User registered successfully');
      setError('');
      // Reset form fields
      setFirstName('');
      setLastName('');
      setUsername('');
      setPassword('');
      setRole('Superuser');
      setEmail('');
    } catch (error) {
      console.error('Error registering user:', error.response ? error.response.data : error.message);
      setError('Error registering user');
      setSuccess('');
    }
  };

  return (
    <div>
      <h1>Register</h1>
      {error && <p>{error}</p>}
      {success && <p>{success}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <select value={role} onChange={(e) => setRole(e.target.value)} required>
          <option value="Superuser">Superuser</option>
          <option value="Company User">Company User</option>
          <option value="Captain">Captain</option>
          <option value="Crew">Crew</option>
        </select>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Register User</button>
      </form>
    </div>
  );
};

export default RegisterComponent;
