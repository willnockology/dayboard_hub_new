import React, { useState } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';

function LoginComponent({ setToken }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const history = useHistory();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Attempting login with username:', username);  // Log username
      const response = await axios.post('http://localhost:5001/api/users/login', { username, password });

      const { token, user } = response.data;

      if (!user) {
        console.error('No user data received:', response.data);
        setError('Invalid login response. Please try again.');
        return;
      }

      console.log('Login successful, received token and user data:', { token, user });  // Log token and user data
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user)); // Store user information

      console.log('User data stored in localStorage:', localStorage.getItem('user'));  // Log stored user data

      if (typeof setToken === 'function') {
        setToken(token);
      } else {
        console.error('setToken is not a function');
      }
      history.push('/dashboard');
    } catch (error) {
      console.error('Error during login:', error.response ? error.response.data : error.message);
      setError('Error during login');
    }
  };

  return (
    <div>
      <h1>Login</h1>
      {error && <p>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default LoginComponent;
