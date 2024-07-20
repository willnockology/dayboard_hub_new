import React, { useState } from 'react';
import axios from 'axios';

const VesselRegistrationComponent = ({ token }) => {
  const [formData, setFormData] = useState({
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
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5001/api/vessels', formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setMessage('Vessel registered successfully!');
      setFormData({
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
    } catch (error) {
      console.error('Error registering vessel:', error);
      setMessage('Error registering vessel');
    }
  };

  return (
    <div>
      <h1>Register Vessel</h1>
      {message && <p>{message}</p>}
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
        <button type="submit">Register Vessel</button>
      </form>
    </div>
  );
};

export default VesselRegistrationComponent;
