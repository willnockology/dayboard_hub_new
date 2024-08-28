import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import countryList from 'react-select-country-list';
import AvatarEditor from 'react-avatar-editor';
import './CrewModuleComponent.css';

const CrewModuleComponent = () => {
  console.log("countryList: ", countryList);
  const [crew, setCrew] = useState([]);
  const [vessels, setVessels] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedCrew, setSelectedCrew] = useState(null);
  const [newCrew, setNewCrew] = useState({
    firstName: '',
    lastName: '',
    username: '',
    password: '',
    position: '',
    nationality: '',
    email: '',
    phoneNumber: '',
    passportNumber: '',
    vessel: '',
    role: 'Crew',
    active: true,
    imageFile: null,
  });
  const [filterVessel, setFilterVessel] = useState(null);
  const [userRole, setUserRole] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [editor, setEditor] = useState(null);

  useEffect(() => {
    fetchCrew();
    fetchVessels();
  }, []);

  const fetchCrew = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('http://localhost:5001/api/users/crew', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCrew(response.data);
      const user = JSON.parse(localStorage.getItem('user'));
      setUserRole(user.role);
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCrew((prevCrew) => ({
      ...prevCrew,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size < 500000 && (file.type === 'image/jpeg' || file.type === 'image/png')) {
      setNewCrew((prevCrew) => ({
        ...prevCrew,
        imageFile: file,
      }));
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      alert('Invalid file. Please upload a JPG or PNG image smaller than 500kb.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('firstName', newCrew.firstName);
    formData.append('lastName', newCrew.lastName);
    formData.append('username', newCrew.username);
    formData.append('password', newCrew.password);
    formData.append('position', newCrew.position);
    formData.append('nationality', newCrew.nationality);
    formData.append('email', newCrew.email);
    formData.append('phoneNumber', newCrew.phoneNumber);
    formData.append('passportNumber', newCrew.passportNumber);
    formData.append('vessel', newCrew.vessel);
    formData.append('role', newCrew.role);
    formData.append('active', newCrew.active);

    if (editor) {
      editor.getImageScaledToCanvas().toBlob((blob) => {
        formData.append('image', blob, newCrew.imageFile.name);
        submitForm(formData);
      });
    } else {
      submitForm(formData);
    }
  };

  const submitForm = async (formData) => {
    try {
      const token = localStorage.getItem('authToken');
      if (editMode) {
        await axios.put(`http://localhost:5001/api/users/${selectedCrew._id}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        alert('Crew member updated successfully');
      } else {
        await axios.post('http://localhost:5001/api/users/register', formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        alert('Crew member added successfully');
      }
      fetchCrew();
      resetForm();
    } catch (error) {
      console.error('Error saving crew member:', error);
    }
  };

  const resetForm = () => {
    setNewCrew({
      firstName: '',
      lastName: '',
      username: '',
      password: '',
      position: '',
      nationality: '',
      email: '',
      phoneNumber: '',
      passportNumber: '',
      vessel: '',
      role: 'Crew',
      active: true,
      imageFile: null,
    });
    setShowForm(false);
    setEditMode(false);
    setSelectedCrew(null);
    setImagePreview(null);
  };

  const handleEditCrew = (crewMember) => {
    setEditMode(true);
    setSelectedCrew(crewMember);
    setNewCrew({
      firstName: crewMember.firstName,
      lastName: crewMember.lastName,
      username: crewMember.username,
      password: '', // Password should be empty in edit mode
      position: crewMember.position,
      nationality: crewMember.nationality,
      email: crewMember.email,
      phoneNumber: crewMember.phoneNumber,
      passportNumber: crewMember.passportNumber,
      vessel: crewMember.assignedVessels.length > 0 ? crewMember.assignedVessels[0]._id : '',
      role: crewMember.role,
      active: crewMember.active,
      imageFile: null,
    });
    setShowForm(true);
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

  const handleDeleteCrew = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this crew member? This action cannot be undone.');
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(`http://localhost:5001/api/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCrew(crew.filter((c) => c._id !== id));
    } catch (error) {
      console.error('Error deleting crew member:', error);
    }
  };

  const handleFilterChange = (selectedOption) => {
    setFilterVessel(selectedOption);
  };

  const filteredCrew = filterVessel
    ? crew.filter((c) =>
        c.assignedVessels.some((v) => v._id === filterVessel.value)
      )
    : crew;

  const activeCrew = filteredCrew.filter((c) => c.active);
  const inactiveCrew = filteredCrew.filter((c) => !c.active);

  const countryOptions = countryList().getData();

  return (
    <div className="crew-module-container">
      <h1>Crew Module</h1>
      <button onClick={() => {
        setShowForm(!showForm);
        resetForm();
      }} className="toggle-form-button">
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
            Username
            <input
              type="text"
              name="username"
              value={newCrew.username}
              onChange={handleInputChange}
              placeholder="Username"
              required
              disabled={editMode} // Disable username editing in edit mode
            />
          </label>
          {!editMode && (
            <label>
              Password
              <input
                type="password"
                name="password"
                value={newCrew.password}
                onChange={handleInputChange}
                placeholder="Password"
                required={!editMode} // Required only in add mode
              />
            </label>
          )}
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
          <label>
            Role
            <select
              name="role"
              value={newCrew.role}
              onChange={handleInputChange}
              required
            >
              <option value="Crew">Crew</option>
              <option value="Captain">Captain</option>
            </select>
          </label>
          <label>
            Active
            <input
              type="checkbox"
              name="active"
              checked={newCrew.active}
              onChange={(e) => handleInputChange({ target: { name: 'active', value: e.target.checked } })}
            />
          </label>
          <label>
            Profile Image
            <input
              type="file"
              name="imageFile"
              accept=".jpg,.png"
              onChange={handleFileChange}
            />
          </label>
          {imagePreview && (
            <AvatarEditor
              ref={setEditor}
              image={imagePreview}
              width={250}
              height={250}
              border={50}
              scale={1.2}
              rotate={0}
            />
          )}
          <button type="submit">{editMode ? 'Update Crew Member' : 'Add Crew Member'}</button>
        </form>
      )}
      {['Superuser', 'Company User'].includes(userRole) && (
        <div>
          <label>
            Filter by Vessel
            <Select
              options={vessels.map(vessel => ({ value: vessel._id, label: vessel.name }))}
              onChange={handleFilterChange}
              placeholder="Select Vessel"
            />
          </label>
        </div>
      )}
      <div className="crew-tables">
        <div className="active-crew">
          <h2>Active Crew</h2>
          <table>
            <thead>
              <tr>
                <th>Profile Image</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Position</th>
                <th>Nationality</th>
                <th>Email</th>
                <th>Phone Number</th>
                <th>Passport Number</th>
                {['Superuser', 'Company User'].includes(userRole) && <th>Vessel</th>}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {activeCrew.map((c) => (
                <tr key={c._id}>
                  <td>
                    <img
                      src={c.photo ? `http://localhost:5001${c.photo}` : 'https://via.placeholder.com/50'} // Correctly constructs the path to the image
                      alt={`${c.firstName} ${c.lastName}`}
                      width="75"
                      height="75"
                      onError={(e) => e.target.src = 'https://via.placeholder.com/50'} // Fallback to placeholder if image fails to load
                    />
                  </td>

                  <td>{c.firstName}</td>
                  <td>{c.lastName}</td>
                  <td>{c.position}</td>
                  <td>{c.nationality}</td>
                  <td>{c.email}</td>
                  <td>{c.phoneNumber}</td>
                  <td>{c.passportNumber}</td>
                  {['Superuser', 'Company User', 'Captain'].includes(userRole) && (
                    <td>{c.assignedVessels.map(v => v.name).join(', ')}</td>
                  )}
                  <td>
                    <button onClick={() => handleToggleActive(c._id)}>
                      {c.active ? 'Deactivate' : 'Activate'}
                    </button>
                    {['Superuser', 'Company User', 'Captain'].includes(userRole) && (
                      <>
                        <button onClick={() => handleEditCrew(c)}>Edit</button>
                        <button onClick={() => handleDeleteCrew(c._id)}>Delete</button>
                      </>
                    )}
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
                <th>Profile Image</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Position</th>
                <th>Nationality</th>
                <th>Email</th>
                <th>Phone Number</th>
                <th>Passport Number</th>
                {['Superuser', 'Company User'].includes(userRole) && <th>Vessel</th>}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inactiveCrew.map((c) => (
                <tr key={c._id}>
                  <td>
                    <img
                      src={c.photo || 'https://via.placeholder.com/50'} // Placeholder if no image is available
                      alt={`${c.firstName} ${c.lastName}`}
                      width="50"
                      height="50"
                    />
                  </td>
                  <td>{c.firstName}</td>
                  <td>{c.lastName}</td>
                  <td>{c.position}</td>
                  <td>{c.nationality}</td>
                  <td>{c.email}</td>
                  <td>{c.phoneNumber}</td>
                  <td>{c.passportNumber}</td>
                  {['Superuser', 'Company User', 'Captain'].includes(userRole) && (
                    <td>{c.assignedVessels.map(v => v.name).join(', ')}</td>
                  )}
                  <td>
                    <button onClick={() => handleToggleActive(c._id)}>
                      {c.active ? 'Deactivate' : 'Activate'}
                    </button>
                    {['Superuser', 'Company User', 'Captain'].includes(userRole) && (
                      <>
                        <button onClick={() => handleEditCrew(c)}>Edit</button>
                        <button onClick={() => handleDeleteCrew(c._id)}>Delete</button>
                      </>
                    )}
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
