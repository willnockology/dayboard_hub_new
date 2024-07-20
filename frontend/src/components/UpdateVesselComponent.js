import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UpdateVesselComponent.css';

const UpdateVesselComponent = ({ token }) => {
  const [vessels, setVessels] = useState([]);
  const [selectedVesselId, setSelectedVesselId] = useState('');
  const [vesselDetails, setVesselDetails] = useState({
    name: '',
    imoNumber: '',
    flagState: '',
    grossTonnage: '',
    regulatoryLength: '',
    typeOfRegistration: '',
    typeOfVessel: '',
    callSign: '',
    portOfRegistry: ''
  });
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchUserDetails = async () => {
      const user = JSON.parse(localStorage.getItem('user'));
      setUser(user);
      console.log('User:', user);

      if (user && user.role === 'Captain' && user.assignedVessels.length > 0) {
        const vesselId = user.assignedVessels[0]; // Assuming the user is assigned to one vessel
        setSelectedVesselId(vesselId);
        fetchVesselDetails(vesselId);
      }
    };

    fetchUserDetails();
  }, []);

  useEffect(() => {
    const fetchVessels = async () => {
      try {
        console.log('Fetching vessels...');
        const response = await axios.get('http://localhost:5001/api/vessels', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setVessels(response.data);
        console.log('Vessels:', response.data);
      } catch (error) {
        console.error('Error fetching vessels:', error);
      }
    };

    fetchVessels();
  }, [token]);

  const fetchVesselDetails = async (vesselId) => {
    try {
      console.log(`Fetching vessel details for vesselId: ${vesselId}`);
      const response = await axios.get(`http://localhost:5001/api/vessels/${vesselId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVesselDetails({
        name: response.data.name || '',
        imoNumber: response.data.imoNumber || '',
        flagState: response.data.flagState || '',
        grossTonnage: response.data.grossTonnage || '',
        regulatoryLength: response.data.regulatoryLength || '',
        typeOfRegistration: response.data.typeOfRegistration || '',
        typeOfVessel: response.data.typeOfVessel || '',
        callSign: response.data.callSign || '',
        portOfRegistry: response.data.portOfRegistry || ''
      });
      console.log('Vessel details:', response.data);
    } catch (error) {
      console.error('Error fetching vessel details:', error);
    }
  };

  const handleVesselChange = (e) => {
    const vesselId = e.target.value;
    setSelectedVesselId(vesselId);
    if (vesselId) {
      fetchVesselDetails(vesselId);
    } else {
      setVesselDetails({
        name: '',
        imoNumber: '',
        flagState: '',
        grossTonnage: '',
        regulatoryLength: '',
        typeOfRegistration: '',
        typeOfVessel: '',
        callSign: '',
        portOfRegistry: ''
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVesselDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5001/api/vessels/${selectedVesselId}`, vesselDetails, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage('Vessel updated successfully!');
    } catch (error) {
      console.error('Error updating vessel:', error);
      setMessage('Error updating vessel');
    }
  };

  return (
    <div className="update-vessel-container">
      <h1>Update Vessel</h1>
      {message && <p>{message}</p>}
      {user && user.role === 'Captain' ? (
        <div>
          <h2>Vessel Details</h2>
          {vesselDetails ? (
            <form className="vessel-form" onSubmit={handleSubmit}>
              <label>
                Vessel Name
                <input
                  type="text"
                  name="name"
                  value={vesselDetails.name}
                  onChange={handleChange}
                />
              </label>
              <label>
                IMO Number
                <input
                  type="text"
                  name="imoNumber"
                  value={vesselDetails.imoNumber}
                  onChange={handleChange}
                />
              </label>
              <label>
                Flag State
                <select name="flagState" value={vesselDetails.flagState} onChange={handleChange}>
                  <option value="">Select Flag State</option>
                  <option value="Cayman Islands">Cayman Islands</option>
                  <option value="Jamaica">Jamaica</option>
                  <option value="St Vincent">St Vincent</option>
                  <option value="Marshall Islands">Marshall Islands</option>
                  <option value="Bahamas">Bahamas</option>
                </select>
              </label>
              <label>
                Gross Tonnage
                <input
                  type="number"
                  name="grossTonnage"
                  value={vesselDetails.grossTonnage}
                  onChange={handleChange}
                />
              </label>
              <label>
                Regulatory Length (meters)
                <input
                  type="number"
                  name="regulatoryLength"
                  value={vesselDetails.regulatoryLength}
                  onChange={handleChange}
                />
              </label>
              <label>
                Type of Registration
                <select
                  name="typeOfRegistration"
                  value={vesselDetails.typeOfRegistration}
                  onChange={handleChange}
                >
                  <option value="">Select Type of Registration</option>
                  <option value="PY">PY</option>
                  <option value="PYLC">PYLC</option>
                  <option value="CY">CY</option>
                </select>
              </label>
              <label>
                Type of Vessel
                <select
                  name="typeOfVessel"
                  value={vesselDetails.typeOfVessel}
                  onChange={handleChange}
                >
                  <option value="">Select Type of Vessel</option>
                  <option value="Container Ship">Container Ship</option>
                  <option value="Yacht">Yacht</option>
                  <option value="Bulk Carrier">Bulk Carrier</option>
                  <option value="Chemical Carrier">Chemical Carrier</option>
                  <option value="Product Carrier">Product Carrier</option>
                  <option value="Crude Oil Carrier">Crude Oil Carrier</option>
                  <option value="LNG">LNG</option>
                </select>
              </label>
              <label>
                Call Sign
                <input
                  type="text"
                  name="callSign"
                  value={vesselDetails.callSign}
                  onChange={handleChange}
                />
              </label>
              <label>
                Port of Registry
                <input
                  type="text"
                  name="portOfRegistry"
                  value={vesselDetails.portOfRegistry}
                  onChange={handleChange}
                />
              </label>
              <button type="submit">Update Vessel</button>
            </form>
          ) : (
            <p>Loading vessel details...</p>
          )}
        </div>
      ) : (
        <>
          <select onChange={handleVesselChange} value={selectedVesselId}>
            <option value="">Select a vessel</option>
            {vessels.map((vessel) => (
              <option key={vessel._id} value={vessel._id}>
                {vessel.name}
              </option>
            ))}
          </select>
          {vesselDetails && (
            <div>
              <h2>Vessel Details</h2>
              <form className="vessel-form" onSubmit={handleSubmit}>
                <label>
                  Vessel Name
                  <input
                    type="text"
                    name="name"
                    value={vesselDetails.name}
                    onChange={handleChange}
                  />
                </label>
                <label>
                  IMO Number
                  <input
                    type="text"
                    name="imoNumber"
                    value={vesselDetails.imoNumber}
                    onChange={handleChange}
                  />
                </label>
                <label>
                  Flag State
                  <select name="flagState" value={vesselDetails.flagState} onChange={handleChange}>
                    <option value="">Select Flag State</option>
                    <option value="Cayman Islands">Cayman Islands</option>
                    <option value="Jamaica">Jamaica</option>
                    <option value="St Vincent">St Vincent</option>
                    <option value="Marshall Islands">Marshall Islands</option>
                    <option value="Bahamas">Bahamas</option>
                  </select>
                </label>
                <label>
                  Gross Tonnage
                  <input
                    type="number"
                    name="grossTonnage"
                    value={vesselDetails.grossTonnage}
                    onChange={handleChange}
                  />
                </label>
                <label>
                  Regulatory Length (meters)
                  <input
                    type="number"
                    name="regulatoryLength"
                    value={vesselDetails.regulatoryLength}
                    onChange={handleChange}
                  />
                </label>
                <label>
                  Type of Registration
                  <select
                    name="typeOfRegistration"
                    value={vesselDetails.typeOfRegistration}
                    onChange={handleChange}
                  >
                    <option value="">Select Type of Registration</option>
                    <option value="PY">PY</option>
                    <option value="PYLC">PYLC</option>
                    <option value="CY">CY</option>
                  </select>
                </label>
                <label>
                  Type of Vessel
                  <select
                    name="typeOfVessel"
                    value={vesselDetails.typeOfVessel}
                    onChange={handleChange}
                  >
                    <option value="">Select Type of Vessel</option>
                    <option value="Container Ship">Container Ship</option>
                    <option value="Yacht">Yacht</option>
                    <option value="Bulk Carrier">Bulk Carrier</option>
                    <option value="Chemical Carrier">Chemical Carrier</option>
                    <option value="Product Carrier">Product Carrier</option>
                    <option value="Crude Oil Carrier">Crude Oil Carrier</option>
                    <option value="LNG">LNG</option>
                  </select>
                </label>
                <label>
                  Call Sign
                  <input
                    type="text"
                    name="callSign"
                    value={vesselDetails.callSign}
                    onChange={handleChange}
                  />
                </label>
                <label>
                  Port of Registry
                  <input
                    type="text"
                    name="portOfRegistry"
                    value={vesselDetails.portOfRegistry}
                    onChange={handleChange}
                  />
                </label>
                <button type="submit">Update Vessel</button>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UpdateVesselComponent;
