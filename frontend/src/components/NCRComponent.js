import React, { useState, useEffect, useCallback, Fragment } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import axios from 'axios';
import './NCRComponent.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faComments, faEdit } from '@fortawesome/free-solid-svg-icons';
import ChatComponent from './ChatComponent';

const NCRComponent = ({ token }) => {
  const [ncrs, setNcrs] = useState([]);
  const [filteredNcrs, setFilteredNcrs] = useState([]);
  const [vessels, setVessels] = useState([]);
  const [selectedVessel, setSelectedVessel] = useState('');
  const [formData, setFormData] = useState({
    vessel: '',
    date: '',
    title: '',
    deficiencyType: '',
    deficiencyIdentifiedBy: '',
    rootCause: '',
    proposedCorrectiveAction: '',
    dueDate: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [role, setRole] = useState('');
  const [showChat, setShowChat] = useState(null);
  const [unreadComments, setUnreadComments] = useState({});

  const history = useHistory();
  const { id } = useParams();
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';

  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-GB', options);
  };

  const formatDateForInput = (isoDate) => {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    return date.toISOString().split('T')[0]; // Convert to "yyyy-MM-dd" format
  };

  const fetchUserRoleAndDetails = useCallback(async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRole(response.data.role);
      if (response.data.vessel && role !== 'Superuser' && role !== 'Company User') {
        setFormData(prevData => ({
          ...prevData,
          vessel: response.data.vessel._id
        }));
      }
    } catch (err) {
      setError('Failed to fetch user role.');
    }
  }, [apiUrl, token, role]);

  useEffect(() => {
    fetchUserRoleAndDetails();
  }, [fetchUserRoleAndDetails]);

  useEffect(() => {
    if (!token) {
      history.push('/login');
    }
  }, [token, history]);

  const fetchNcrs = useCallback(async () => {
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
  }, [apiUrl, token]);

  const fetchVessels = useCallback(async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/vessels`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVessels(response.data);
    } catch (err) {
      setError('Failed to fetch vessels.');
    }
  }, [apiUrl, token]);

  useEffect(() => {
    fetchNcrs();
    fetchVessels();
  }, [fetchNcrs, fetchVessels]);

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
      const formattedData = {
        ...formData,
        date: formData.date ? new Date(formData.date).toISOString() : null,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
      };

      if (isEditing) {
        await axios.put(`${apiUrl}/api/ncrs/${id}`, formattedData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`${apiUrl}/api/ncrs`, formattedData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      setFormData({
        vessel: '',
        date: '',
        title: '',
        deficiencyType: '',
        deficiencyIdentifiedBy: '',
        rootCause: '',
        proposedCorrectiveAction: '',
        dueDate: '',
      });
      setIsEditing(false);
      setShowForm(false);
      history.push('/ncrs');
    } catch (err) {
      console.error('Failed to submit NCR:', err);
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
          const fetchedData = response.data;
          setFormData({
            ...fetchedData,
            date: formatDateForInput(fetchedData.date),
            dueDate: formatDateForInput(fetchedData.dueDate),
          });
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

  const markCommentsAsRead = async (documentId) => {
    try {
      await axios.post(`${apiUrl}/api/chats/markAsRead`, { documentId }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUnreadComments((prevUnreadComments) => ({
        ...prevUnreadComments,
        [documentId]: false,
      }));
    } catch (error) {
      console.error('Error marking comments as read:', error.response ? error.response.data : error.message);
    }
  };

  const handleToggleChat = (ncrId) => {
    setShowChat(showChat === ncrId ? null : ncrId);
    if (showChat !== ncrId) {
      markCommentsAsRead(ncrId);
    }
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
            <Fragment>
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
              <label>Title:</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                maxLength={50}
                required
              />
              <label>Type of Deficiency:</label>
              <select
                name="deficiencyType"
                value={formData.deficiencyType}
                onChange={handleChange}
                required
              >
                <option value="">Select Type</option>
                <option value="Deficiency">Deficiency</option>
                <option value="Observation">Observation</option>
                <option value="Non-Conformity">Non-Conformity</option>
                <option value="Major Non-Conformity">Major Non-Conformity</option>
              </select>
              <label>Deficiency Identified By:</label>
              <select
                name="deficiencyIdentifiedBy"
                value={formData.deficiencyIdentifiedBy}
                onChange={handleChange}
                required
              >
                <option value="">Select Identifier</option>
                <option value="Crew">Crew</option>
                <option value="Company">Company</option>
                <option value="Class">Class</option>
                <option value="Flag">Flag</option>
                <option value="Port State Control">Port State Control</option>
                <option value="Other">Other</option>
              </select>
              <label>Root Cause:</label>
              <input
                type="text"
                name="rootCause"
                value={formData.rootCause}
                onChange={handleChange}
              />
              <label>Proposed Corrective Action:</label>
              <input
                type="text"
                name="proposedCorrectiveAction"
                value={formData.proposedCorrectiveAction}
                onChange={handleChange}
              />
              <label>Due Date:</label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                required
              />
                </form>
              <button 
                className='submit-NCR-button'
                type="submit"
                >
                  {isEditing ? 'Update NCR' : 'Submit NCR'}
              </button>
              

              </Fragment>
          ) : (
            <div className="ncr-list">
              <table>
                <thead>
                  <tr>
                    {(role === 'Superuser' || role === 'Company User') && <th>Vessel</th>}
                    <th>Report Number</th>
                    <th>Date</th>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNcrs.map(ncr => {
                    const showChatForNcr = showChat === ncr._id;
                    return (
                      <React.Fragment key={ncr._id}>
                        <tr className={ncr.status.toLowerCase().replace(' ', '-')}>
                          {(role === 'Superuser' || role === 'Company User') && <td>{ncr.vessel.name}</td>}
                          <td>{ncr.reportNumber}</td>
                          <td>{formatDate(ncr.date)}</td>
                          <td>{ncr.title}</td>
                          <td>{ncr.deficiencyType}</td>
                          <td>{ncr.status}</td>
                          <td>
                            <button className="action-icon" onClick={() => handleToggleChat(ncr._id)}>
                              <FontAwesomeIcon icon={faComments} style={{ color: showChatForNcr ? 'black' : unreadComments[ncr._id] ? 'orange' : '#3eb4e4' }} />
                            </button>
                            <button className="action-icon" onClick={() => history.push(`/ncrs/edit/${ncr._id}`)}>
                              <FontAwesomeIcon icon={faEdit} style={{ color: 'orange' }} />
                            </button>
                            <button className="action-icon trash-icon" onClick={() => handleDelete(ncr._id)}>
                              <FontAwesomeIcon icon={faTrashAlt} />
                            </button>
                          </td>
                        </tr>
                        {showChatForNcr && (
                          <tr key={`chat-${ncr._id}`} className="chat-row">
                            <td colSpan={role === 'Superuser' || role === 'Company User' ? '7' : '6'}>
                              <ChatComponent documentId={ncr._id} itemName={ncr.title} markAsRead={markCommentsAsRead} />
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
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
