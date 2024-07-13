import React, { useState } from 'react';
import axios from 'axios';

const VesselRegistrationComponent = ({ token }) => {
  const [name, setName] = useState('');
  const [imoNumber, setImoNumber] = useState('');
  const [flagState, setFlagState] = useState('');
  const [grossTonnage, setGrossTonnage] = useState('');
  const [regulatoryLength, setRegulatoryLength] = useState('');
  const [typeOfRegistration, setTypeOfRegistration] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      await axios.post(
        'http://localhost:5001/api/vessels',
        { name, imoNumber, flagState, grossTonnage, regulatoryLength, typeOfRegistration },
        config
      );

      setSuccess('Vessel registered successfully');
      setName('');
      setImoNumber('');
      setFlagState('');
      setGrossTonnage('');
      setRegulatoryLength('');
      setTypeOfRegistration('');
    } catch (error) {
      setError(error.response?.data?.message || 'Error registering vessel');
    }
  };

  const registrationOptions = (flagState) => {
    if (flagState === 'Cayman Islands' || flagState === 'Bahamas') {
      return (
        <>
          <option value="PY">PY</option>
          <option value="CY">CY</option>
        </>
      );
    } else if (flagState === 'Jamaica' || flagState === 'St Vincent' || flagState === 'Marshall Islands') {
      return (
        <>
          <option value="PY">PY</option>
          <option value="PYLC">PYLC</option>
          <option value="CY">CY</option>
        </>
      );
    }
    return <option value="">Select Type of Registration</option>;
  };

  return (
    <div className="vessel-registration-container">
      <h1>Register Vessel</h1>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
      <form onSubmit={handleSubmit}>
        <label>
          Name:
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          IMO Number:
          <input type="text" value={imoNumber} onChange={(e) => setImoNumber(e.target.value)} required />
        </label>
        <label>
          Flag State:
          <select value={flagState} onChange={(e) => setFlagState(e.target.value)} required>
            <option value="">Select Flag State</option>
            <option value="Cayman Islands">Cayman Islands</option>
            <option value="Jamaica">Jamaica</option>
            <option value="St Vincent">St Vincent</option>
            <option value="Marshall Islands">Marshall Islands</option>
            <option value="Bahamas">Bahamas</option>
          </select>
        </label>
        <label>
          Gross Tonnage:
          <input type="number" value={grossTonnage} onChange={(e) => setGrossTonnage(e.target.value)} required />
        </label>
        <label>
          Regulatory Length (meters):
          <input type="number" value={regulatoryLength} onChange={(e) => setRegulatoryLength(e.target.value)} required />
        </label>
        <label>
          Type of Registration:
          <select value={typeOfRegistration} onChange={(e) => setTypeOfRegistration(e.target.value)} required>
            {registrationOptions(flagState)}
          </select>
        </label>
        <button type="submit">Register Vessel</button>
      </form>
    </div>
  );
};

export default VesselRegistrationComponent;
