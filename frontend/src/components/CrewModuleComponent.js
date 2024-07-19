import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import countryList from 'react-select-country-list';
import './CrewModuleComponent.css';

const CrewModuleComponent = () => {
  const [crew, setCrew] = useState([]);
  const [vessels, setVessels] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newCrew, setNewCrew] = useState({
    firstName: '',
    lastName: '',
    position: '',
    nationality: '',
    email: '',
    phoneNumber: '',
    passportNumber: '',
    vessel: '',
    role: 'Crew',
    active: true,
  });

  const fetchCrew = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('http://localhost:5001/api/users/crew', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCrew(response.data);
    } catch (error) {
      console.error('Error fetching crew:', error);
    }
  };

  const fetchVessels = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('http://localhost:5001/api/vessels', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setVessels(response.data);
    } catch (error) {
      console.error('Error fetching vessels:', error);
    }
  };

  useEffect(() => {
    fetchCrew();
    fetchVessels();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCrew((prevCrew) => ({
      ...prevCrew,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    for (const key in newCrew) {
      formData.append(key, newCrew[key]);
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post('http://localhost:5001/api/users/register', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setCrew([...crew, response.data.user]);
      setNewCrew({
        firstName: '',
        lastName: '',
        position: '',
        nationality: '',
        email: '',
        phoneNumber: '',
        passportNumber: '',
        vessel: '',
        role: 'Crew',
        active: true,
      });
      setShowForm(false);
    } catch (error) {
      console.error('Error adding crew member:', error);
    }
  };

  const handleToggleActive = async (id) => {
    try {
      const token = localStorage.getItem('authToken');
      const crewMember = crew.find((c) => c._id === id);
      const updatedCrew = { ...crewMember, active: !crewMember.active };
      await axios.put(`http://localhost:5001/api/users/${id}/profile`, updatedCrew, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCrew(crew.map((c) => (c._id === id ? updatedCrew : c)));
    } catch (error) {
      console.error('Error toggling active status:', error);
    }
  };

  const activeCrew = crew.filter((c) => c.active);
  const inactiveCrew = crew.filter((c) => !c.active);

  const countryOptions = countryList().getData();

  return (
    <div className="crew-module-container">
      <h1>Crew Module</h1>
      <button onClick={() => setShowForm(!showForm)} className="toggle-form-button">
        {showForm ? 'Hide Form' : 'Add New Crew'}
      </button>
      {showForm && (
        <form onSubmit={handleSubmit} className="new-crew-form">
          <label>
            First Name
            <input
              type="text"
              name="firstName"
              value={newCrew.firstName}
              onChange={handleInputChange}
              placeholder="First Name"
              required
            />
          </label>
          <label>
            Last Name
            <input
              type="text"
              name="lastName"
              value={newCrew.lastName}
              onChange={handleInputChange}
              placeholder="Last Name"
              required
            />
          </label>
          <label>
            Position
            <select
              name="position"
              value={newCrew.position}
              onChange={handleInputChange}
              required
            >
              <option value="" disabled>Select Position</option>
              {['Master', 'Chief Officer', 'Second Officer', 'Third Officer', 'Chief Engineer', 'Second Engineer', 'Third Engineer', 'Bosun', 'Deckhand', 'Stew', 'AB', 'Oiler', 'Deck Rating', 'Engine Rating'].map((pos) => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>
          </label>
          <label>
            Nationality
            <Select
              options={countryOptions}
              name="nationality"
              value={countryOptions.find(option => option.value === newCrew.nationality)}
              onChange={(option) => setNewCrew((prevCrew) => ({
                ...prevCrew,
                nationality: option.value,
              }))}
              placeholder="Select Nationality"
            />
          </label>
          <label>
            Email
            <input
              type="email"
              name="email"
              value={newCrew.email}
              onChange={handleInputChange}
              placeholder="Email"
              required
            />
          </label>
          <label>
            Phone Number
            <input
              type="tel"
              name="phoneNumber"
              value={newCrew.phoneNumber}
              onChange={handleInputChange}
              placeholder="Phone Number"
              required
            />
          </label>
          <label>
            Passport Number
            <input
              type="text"
              name="passportNumber"
              value={newCrew.passportNumber}
              onChange={handleInputChange}
              placeholder="Passport Number"
              required
            />
          </label>
          <label>
            Vessel
            <select
              name="vessel"
              value={newCrew.vessel}
              onChange={handleInputChange}
              required
            >
              <option value="" disabled>Select Vessel</option>
              {vessels.map((vessel) => (
                <option key={vessel._id} value={vessel._id}>{vessel.name}</option>
              ))}
            </select>
          </label>
          <button type="submit">Add Crew Member</button>
        </form>
      )}
      <div className="crew-tables">
        <div className="active-crew">
          <h2>Active Crew</h2>
          <table>
            <thead>
              <tr>
                <th>Photo</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Position</th>
                <th>Nationality</th>
                <th>Email</th>
                <th>Phone Number</th>
                <th>Passport Number</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {activeCrew.map((c) => (
                <tr key={c._id}>
                  <td><img src={c.photo} alt="Crew" /></td>
                  <td>{c.firstName}</td>
                  <td>{c.lastName}</td>
                  <td>{c.position}</td>
                  <td>{c.nationality}</td>
                  <td>{c.email}</td>
                  <td>{c.phoneNumber}</td>
                  <td>{c.passportNumber}</td>
                  <td>
                    <button onClick={() => handleToggleActive(c._id)}>Deactivate</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="inactive-crew">
          <h2>Inactive Crew</h2>
          <table>
            <thead>
              <tr>
                <th>Photo</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Position</th>
                <th>Nationality</th>
                <th>Email</th>
                <th>Phone Number</th>
                <th>Passport Number</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inactiveCrew.map((c) => (
                <tr key={c._id}>
                  <td><img src={c.photo} alt="Crew" /></td>
                  <td>{c.firstName}</td>
                  <td>{c.lastName}</td>
                  <td>{c.position}</td>
                  <td>{c.nationality}</td>
                  <td>{c.email}</td>
                  <td>{c.phoneNumber}</td>
                  <td>{c.passportNumber}</td>
                  <td>
                    <button onClick={() => handleToggleActive(c._id)}>Activate</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CrewModuleComponent;
