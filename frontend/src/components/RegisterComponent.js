import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import Select from 'react-select';

const RegisterComponent = ({ setToken }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    password: '',
    role: 'Superuser',
    email: '',
    phoneNumber: '',
    birthday: '',
    startDate: '',
    position: '',
    commercial: false,
    photo: '',
    nationality: '',
    embarked: '',
    passportNumber: '',
    active: true,
  });
  const [vessels, setVessels] = useState([]);
  const [assignedVessels, setAssignedVessels] = useState([]);
  const [error, setError] = useState('');
  const history = useHistory();

  useEffect(() => {
    const fetchVessels = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          setError('No authentication token found');
          return;
        }
        const response = await axios.get('http://localhost:5001/api/vessels', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setVessels(response.data.map(vessel => ({
          value: vessel._id,
          label: vessel.name
        })));
      } catch (error) {
        console.error('Error fetching vessels:', error);
      }
    };
    fetchVessels();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: checked,
    }));
  };

  const handleVesselChange = (selectedOptions) => {
    console.log('Selected vessels:', selectedOptions);
    setAssignedVessels(Array.isArray(selectedOptions) ? selectedOptions : [selectedOptions]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('authToken');
    if (!token) {
      setError('No authentication token found');
      return;
    }

    console.log('Assigned Vessels before check:', assignedVessels);

    if (formData.role !== 'Superuser' && assignedVessels.length === 0) {
      setError('Please assign at least one vessel');
      return;
    }

    const data = {
      ...formData,
      assignedVessels: formData.role === 'Superuser' ? vessels.map(v => v.value) : assignedVessels.map(option => option.value),
    };

    console.log('Form Data before sending:', data);

    try {
      const response = await axios.post('http://localhost:5001/api/users/register', data, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const { token: newToken, user } = response.data;

      localStorage.setItem('authToken', newToken);
      localStorage.setItem('user', JSON.stringify(user));

      if (typeof setToken === 'function') {
        setToken(newToken);
      }
      history.push('/dashboard');
    } catch (error) {
      console.error('Error registering user:', error.response ? error.response.data : error.message);
      setError(error.response?.data?.message || 'Error registering user');
    }
  };

  return (
    <div>
      <h1>Register</h1>
      {error && <p>{error}</p>}
      <form onSubmit={handleSubmit}>
        <label>
          First Name
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Last Name
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Username
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Role
          <select name="role" value={formData.role} onChange={handleChange} required>
            <option value="Superuser">Superuser</option>
            <option value="Company User">Company User</option>
            <option value="Captain">Captain</option>
            <option value="Crew">Crew</option>
          </select>
        </label>
        <label>
          Email
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Phone Number
          <input
            type="text"
            name="phoneNumber"
            placeholder="Phone Number"
            value={formData.phoneNumber}
            onChange={handleChange}
          />
        </label>
        <label>
          Birthday
          <input
            type="date"
            name="birthday"
            placeholder="Birthday"
            value={formData.birthday}
            onChange={handleChange}
          />
        </label>
        <label>
          Start Date
          <input
            type="date"
            name="startDate"
            placeholder="Start Date"
            value={formData.startDate}
            onChange={handleChange}
          />
        </label>
        {formData.role === 'Superuser' || formData.role === 'Company User' ? (
          <label>
            Position
            <input
              type="text"
              name="position"
              placeholder="Position"
              value={formData.position}
              onChange={handleChange}
            />
          </label>
        ) : (
          <label>
            Position
            <select name="position" value={formData.position} onChange={handleChange} required>
              <option value="">Select Position</option>
              <option value="Master">Master</option>
              <option value="Chief Officer">Chief Officer</option>
              <option value="Second Officer">Second Officer</option>
              <option value="Third Officer">Third Officer</option>
              <option value="Chief Engineer">Chief Engineer</option>
              <option value="Second Engineer">Second Engineer</option>
              <option value="Third Engineer">Third Engineer</option>
              <option value="Bosun">Bosun</option>
              <option value="Deckhand">Deckhand</option>
              <option value="Stew">Stew</option>
              <option value="AB">AB</option>
              <option value="Oiler">Oiler</option>
              <option value="Deck Rating">Deck Rating</option>
              <option value="Engine Rating">Engine Rating</option>
            </select>
          </label>
        )}
        <label>
          Photo URL
          <input
            type="text"
            name="photo"
            placeholder="Photo URL"
            value={formData.photo}
            onChange={handleChange}
          />
        </label>
        <label>
          Nationality
          <input
            type="text"
            name="nationality"
            placeholder="Nationality"
            value={formData.nationality}
            onChange={handleChange}
          />
        </label>
        <label>
          Embarked Date
          <input
            type="date"
            name="embarked"
            placeholder="Embarked Date"
            value={formData.embarked}
            onChange={handleChange}
          />
        </label>
        <label>
          Passport Number
          <input
            type="text"
            name="passportNumber"
            placeholder="Passport Number"
            value={formData.passportNumber}
            onChange={handleChange}
          />
        </label>
        <label>
          <input
            type="checkbox"
            name="commercial"
            checked={formData.commercial}
            onChange={handleCheckboxChange}
          />
          Commercial
        </label>
        {(formData.role === 'Captain' || formData.role === 'Crew') && (
          <label>
            <input
              type="checkbox"
              name="active"
              checked={formData.active}
              onChange={handleCheckboxChange}
            />
            Active
          </label>
        )}
        {formData.role !== 'Superuser' && (
          <label>
            Assigned Vessels
            <Select
              name="assignedVessels"
              value={assignedVessels}
              onChange={handleVesselChange}
              options={vessels}
              isMulti={formData.role === 'Company User'}
              isDisabled={formData.role === 'Superuser'}
              required={formData.role !== 'Superuser'}
            />
          </label>
        )}
        <button type="submit">Register User</button>
      </form>
    </div>
  );
};

export default RegisterComponent;
