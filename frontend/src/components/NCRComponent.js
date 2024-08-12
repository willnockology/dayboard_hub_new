import React, { useState, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import axios from 'axios';
import './NCRComponent.css';

const NCRComponent = ({ token }) => {
  const [ncrs, setNcrs] = useState([]);
  const [filteredNcrs, setFilteredNcrs] = useState([]);
  const [vessels, setVessels] = useState([]);
  const [selectedVessel, setSelectedVessel] = useState('');
  const [formData, setFormData] = useState({
    vessel: '',
    date: '',
    description: '',
    rootCause: '',
    correctiveAction: '',
    dueDate: '',
    closedDate: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [role, setRole] = useState('');
  const [currentUser, setCurrentUser] = useState({});

  const history = useHistory();
  const { id } = useParams();

  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';

  useEffect(() => {
    const fetchUserRoleAndDetails = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRole(response.data.role);
        setCurrentUser(response.data);
        if (response.data.vessel && role !== 'Superuser' && role !== 'Company User') {
          setFormData(prevData => ({
            ...prevData,
            vessel: response.data.vessel._id
          }));
        }
      } catch (err) {
        setError('Failed to fetch user role.');
      }
    };

    fetchUserRoleAndDetails();
  }, [token, apiUrl, role]);

  useEffect(() => {
    if (!token) {
      history.push('/login');
    }
  }, [token, history]);

  useEffect(() => {
    const fetchNcrs = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/ncrs`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNcrs(response.data);
        setFilteredNcrs(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch NCRs.');
        setLoading(false);
      }
    };

    const fetchVessels = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/vessels`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setVessels(response.data);
      } catch (err) {
        setError('Failed to fetch vessels.');
      }
    };

    fetchNcrs();
    fetchVessels();
  }, [token, apiUrl]);

  useEffect(() => {
    if (selectedVessel) {
      const filtered = ncrs.filter(ncr => ncr.vessel._id === selectedVessel);
      setFilteredNcrs(filtered);
    } else {
      setFilteredNcrs(ncrs);
    }
  }, [selectedVessel, ncrs]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
      };

      if (role !== 'Superuser' && role !== 'Company User') {
        payload.vessel = currentUser.vessel._id; // Auto-set vessel for Captain and Crew
      }

      console.log('Submitting NCR:', payload);  // Log the payload being submitted

      if (isEditing) {
        payload.status = formData.correctiveAction ? 'Pending DPA Sign Off' : 'Open';
        await axios.put(`${apiUrl}/api/ncrs/${id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`${apiUrl}/api/ncrs`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      setFormData({
        vessel: '',
        date: '',
        description: '',
        rootCause: '',
        correctiveAction: '',
        dueDate: '',
        closedDate: '',
      });
      setIsEditing(false);
      setShowForm(false);
      history.push('/ncrs');
    } catch (err) {
      console.error('Failed to submit NCR:', err);  // Log the error
      setError('Failed to submit NCR.');
    }
  };

  useEffect(() => {
    if (id) {
      const fetchNcr = async () => {
        try {
          const response = await axios.get(`${apiUrl}/api/ncrs/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setFormData(response.data);
          setIsEditing(true);
          setShowForm(true);
        } catch (err) {
          setError('Failed to load NCR for editing.');
        }
      };
      fetchNcr();
    }
  }, [id, token, apiUrl]);

  const handleDelete = async (ncrId) => {
    if (window.confirm('Are you sure you want to delete this NCR?')) {
      try {
        await axios.delete(`${apiUrl}/api/ncrs/${ncrId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNcrs(ncrs.filter(ncr => ncr._id !== ncrId));
        setFilteredNcrs(filteredNcrs.filter(ncr => ncr._id !== ncrId));
      } catch (err) {
        setError('Failed to delete NCR.');
      }
    }
  };

  const handleVesselFilterChange = (e) => {
    setSelectedVessel(e.target.value);
  };

  return (
    <div className="ncr-component">
      {loading ? (
        <div>Loading NCRs...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <>
          <div className="header-controls">
            <div className="filter-container" style={{ display: showForm ? 'none' : 'flex' }}>
              <label>Filter by Vessel:</label>
              <select value={selectedVessel} onChange={handleVesselFilterChange}>
                <option value="">All Vessels</option>
                {vessels.map(vessel => (
                  <option key={vessel._id} value={vessel._id}>
                    {vessel.name}
                  </option>
                ))}
              </select>
            </div>
            <button className="add-item-button" onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Cancel' : 'Add New NCR'}
            </button>
          </div>

          {showForm ? (
            <form className="ncr-form" onSubmit={handleSubmit}>
              {(role === 'Superuser' || role === 'Company User') && (
                <>
                  <label>Vessel:</label>
                  <select
                    name="vessel"
                    value={formData.vessel}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Vessel</option>
                    {vessels.map(vessel => (
                      <option key={vessel._id} value={vessel._id}>
                        {vessel.name}
                      </option>
                    ))}
                  </select>
                </>
              )}

              <label>Date:</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
              <label>Description:</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
              />
              <label>Root Cause:</label>
              <input
                type="text"
                name="rootCause"
                value={formData.rootCause}
                onChange={handleChange}
              />
              <label>Corrective Action:</label>
              <input
                type="text"
                name="correctiveAction"
                value={formData.correctiveAction}
                onChange={handleChange}
              />
              <label>Due Date:</label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
              />
              <label>Closed Date:</label>
              <input
                type="date"
                name="closedDate"
                value={formData.closedDate}
                onChange={handleChange}
              />
              <button type="submit">{isEditing ? 'Update NCR' : 'Submit NCR'}</button>
            </form>
          ) : (
            <div className="ncr-list">
              <table>
                <thead>
                  <tr>
                    <th>Vessel</th>
                    <th>Report Number</th>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNcrs.map(ncr => (
                    <tr key={ncr._id} className={ncr.status.toLowerCase().replace(' ', '-')}>
                      <td>{ncr.vessel.name}</td>
                      <td>{ncr.reportNumber}</td>
                      <td>{new Date(ncr.date).toLocaleDateString()}</td>
                      <td>{ncr.description}</td>
                      <td>{ncr.status}</td>
                      <td>
                        <button onClick={() => history.push(`/ncrs/edit/${ncr._id}`)}>Edit</button>
                        <button onClick={() => handleDelete(ncr._id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NCRComponent;
