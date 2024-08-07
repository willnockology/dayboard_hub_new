import React, { useState, useEffect, useCallback } from 'react';
import './VesselFormComponent.css';
import axios from 'axios';

const VesselFormComponent = ({ token }) => {
  const [vessels, setVessels] = useState([]);
  const [selectedVesselId, setSelectedVesselId] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    imoNumber: '',
    flagState: '',
    grossTonnage: '',
    regulatoryLength: '',
    typeOfRegistration: '',
    typeOfVessel: '',
    callSign: '',
    portOfRegistry: '',
    numberOfPeople: '',
  });
  const [message, setMessage] = useState('');
  const [formMode, setFormMode] = useState(null); // null, 'add', or 'update'

  // Fetch vessels for the dropdown
  const fetchVessels = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/vessels', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVessels(response.data);
    } catch (error) {
      console.error('Error fetching vessels:', error);
    }
  }, [token]);

  // Fetch selected vessel details for updating
  const fetchVesselDetails = useCallback(async (vesselId) => {
    if (!vesselId) return; // If no vessel is selected, skip fetching
    try {
      const response = await axios.get(`http://localhost:5001/api/vessels/${vesselId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFormData({
        name: response.data.name || '',
        imoNumber: response.data.imoNumber || '',
        flagState: response.data.flagState || '',
        grossTonnage: response.data.grossTonnage || '',
        regulatoryLength: response.data.regulatoryLength || '',
        typeOfRegistration: response.data.typeOfRegistration || '',
        typeOfVessel: response.data.typeOfVessel || '',
        callSign: response.data.callSign || '',
        portOfRegistry: response.data.portOfRegistry || '',
        numberOfPeople: response.data.numberOfPeople || '',
      });
    } catch (error) {
      console.error('Error fetching vessel details:', error);
    }
  }, [token]);

  useEffect(() => {
    if (formMode === 'update') {
      fetchVessels();
    }
  }, [fetchVessels, formMode]);

  // Handle vessel selection change
  const handleVesselChange = (e) => {
    const vesselId = e.target.value;
    setSelectedVesselId(vesselId);
    if (vesselId) {
      fetchVesselDetails(vesselId);
    } else {
      // Reset form for new vessel registration
      setFormData({
        name: '',
        imoNumber: '',
        flagState: '',
        grossTonnage: '',
        regulatoryLength: '',
        typeOfRegistration: '',
        typeOfVessel: '',
        callSign: '',
        portOfRegistry: '',
        numberOfPeople: '',
      });
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle form submission for both add and update
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedVesselId) {
        // Update existing vessel
        await axios.put(`http://localhost:5001/api/vessels/${selectedVesselId}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessage('Vessel updated successfully!');
      } else {
        // Add new vessel
        await axios.post('http://localhost:5001/api/vessels', formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessage('Vessel registered successfully!');
        // Optionally, refresh the vessel list to include the new vessel
        fetchVessels();
      }
      setFormData({
        name: '',
        imoNumber: '',
        flagState: '',
        grossTonnage: '',
        regulatoryLength: '',
        typeOfRegistration: '',
        typeOfVessel: '',
        callSign: '',
        portOfRegistry: '',
        numberOfPeople: '',
      });
      setSelectedVesselId('');
      setFormMode(null);
    } catch (error) {
      console.error('Error submitting vessel data:', error);
      setMessage('Error submitting vessel data');
    }
  };

  return (
    <div>
      <h1>Vessel Management</h1>
      {message && <p>{message}</p>}
      {formMode === null && (
        <div>
          <button onClick={() => setFormMode('add')}>Add New Vessel</button>
          <button onClick={() => setFormMode('update')}>Update Existing Vessel</button>
        </div>
      )}
      {formMode === 'add' && (
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Vessel Name"
            required
          />
          <input
            type="text"
            name="imoNumber"
            value={formData.imoNumber}
            onChange={handleChange}
            placeholder="IMO Number"
            required
          />
          <select
            name="flagState"
            value={formData.flagState}
            onChange={handleChange}
            required
          >
            <option value="">Select Flag State</option>
            <option value="Cayman Islands">Cayman Islands</option>
            <option value="Jamaica">Jamaica</option>
            <option value="St Vincent">St Vincent</option>
            <option value="Marshall Islands">Marshall Islands</option>
            <option value="Bahamas">Bahamas</option>
          </select>
          <input
            type="number"
            name="grossTonnage"
            value={formData.grossTonnage}
            onChange={handleChange}
            placeholder="Gross Tonnage"
            required
          />
          <input
            type="number"
            name="regulatoryLength"
            value={formData.regulatoryLength}
            onChange={handleChange}
            placeholder="Regulatory Length (meters)"
            required
          />
          <select
            name="typeOfRegistration"
            value={formData.typeOfRegistration}
            onChange={handleChange}
            required
          >
            <option value="">Select Type of Registration</option>
            {formData.flagState === 'Cayman Islands' || formData.flagState === 'Bahamas' ? (
              <>
                <option value="PY">PY</option>
                <option value="CY">CY</option>
              </>
            ) : (
              <>
                <option value="PY">PY</option>
                <option value="PYLC">PYLC</option>
                <option value="CY">CY</option>
              </>
            )}
          </select>
          <select
            name="typeOfVessel"
            value={formData.typeOfVessel}
            onChange={handleChange}
            required
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
          <input
            type="text"
            name="callSign"
            value={formData.callSign}
            onChange={handleChange}
            placeholder="Call Sign"
            required
          />
          <input
            type="text"
            name="portOfRegistry"
            value={formData.portOfRegistry}
            onChange={handleChange}
            placeholder="Port of Registry"
            required
          />
          <input
            type="number"
            name="numberOfPeople"
            value={formData.numberOfPeople}
            onChange={handleChange}
            placeholder="Number of People (Optional)"
          />
          <button type="submit">Register Vessel</button>
        </form>
      )}
      {formMode === 'update' && (
        <>
          <select onChange={handleVesselChange} value={selectedVesselId}>
            <option value="">Select a vessel</option>
            {vessels.map((vessel) => (
              <option key={vessel._id} value={vessel._id}>
                {vessel.name}
              </option>
            ))}
          </select>
          {selectedVesselId && (
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Vessel Name"
                required
              />
              <input
                type="text"
                name="imoNumber"
                value={formData.imoNumber}
                onChange={handleChange}
                placeholder="IMO Number"
                required
              />
              <select
                name="flagState"
                value={formData.flagState}
                onChange={handleChange}
                required
              >
                <option value="">Select Flag State</option>
                <option value="Cayman Islands">Cayman Islands</option>
                <option value="Jamaica">Jamaica</option>
                <option value="St Vincent">St Vincent</option>
                <option value="Marshall Islands">Marshall Islands</option>
                <option value="Bahamas">Bahamas</option>
              </select>
              <input
                type="number"
                name="grossTonnage"
                value={formData.grossTonnage}
                onChange={handleChange}
                placeholder="Gross Tonnage"
                required
              />
              <input
                type="number"
                name="regulatoryLength"
                value={formData.regulatoryLength}
                onChange={handleChange}
                placeholder="Regulatory Length (meters)"
                required
              />
              <select
                name="typeOfRegistration"
                value={formData.typeOfRegistration}
                onChange={handleChange}
                required
              >
                <option value="">Select Type of Registration</option>
                {formData.flagState === 'Cayman Islands' || formData.flagState === 'Bahamas' ? (
                  <>
                    <option value="PY">PY</option>
                    <option value="CY">CY</option>
                  </>
                ) : (
                  <>
                    <option value="PY">PY</option>
                    <option value="PYLC">PYLC</option>
                    <option value="CY">CY</option>
                  </>
                )}
              </select>
              <select
                name="typeOfVessel"
                value={formData.typeOfVessel}
                onChange={handleChange}
                required
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
              <input
                type="text"
                name="callSign"
                value={formData.callSign}
                onChange={handleChange}
                placeholder="Call Sign"
                required
              />
              <input
                type="text"
                name="portOfRegistry"
                value={formData.portOfRegistry}
                onChange={handleChange}
                placeholder="Port of Registry"
                required
              />
              <input
                type="number"
                name="numberOfPeople"
                value={formData.numberOfPeople}
                onChange={handleChange}
                placeholder="Number of People (Optional)"
              />
              <button type="submit">Update Vessel</button>
            </form>
          )}
        </>
      )}
    </div>
  );
};

export default VesselFormComponent;
