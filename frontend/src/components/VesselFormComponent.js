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
    builder: '',
    model: '',
    hullId: '',
    officialNumber: '',
    mmsiNumber: '',
    loa: '',
    netTonnage: '',
    beam: '',
    depth: '',
    waterCapacity: '',
    fuelCapacity: '',
    cruisingSpeed: '',
    maxSpeed: '',
    cruisingRange: '',
    cruisingArea: '',
    usDutyPaid: false,
    vatPaid: false,
    mainEngineModel: '',
    mainEngineKw: '',
    numberOfMainEngines: '',
    ecdis: false,
    ballastTanks: false,
    hullMaterial: '',
    superstructureMaterial: '',
    helicopter: false,
    submersible: false,
  });
  const [message, setMessage] = useState('');
  const [formMode, setFormMode] = useState(null);

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

  const fetchVesselDetails = useCallback(async (vesselId) => {
    if (!vesselId) return;
    try {
      const response = await axios.get(`http://localhost:5001/api/vessels/${vesselId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFormData({
        ...response.data,
        usDutyPaid: response.data.usDutyPaid || false,
        vatPaid: response.data.vatPaid || false,
        ecdis: response.data.ecdis || false,
        ballastTanks: response.data.ballastTanks || false,
        helicopter: response.data.helicopter || false,
        submersible: response.data.submersible || false,
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

  const handleVesselChange = (e) => {
    const vesselId = e.target.value;
    setSelectedVesselId(vesselId);
    if (vesselId) {
      fetchVesselDetails(vesselId);
    } else {
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
        builder: '',
        model: '',
        hullId: '',
        officialNumber: '',
        mmsiNumber: '',
        loa: '',
        netTonnage: '',
        beam: '',
        depth: '',
        waterCapacity: '',
        fuelCapacity: '',
        cruisingSpeed: '',
        maxSpeed: '',
        cruisingRange: '',
        cruisingArea: '',
        usDutyPaid: false,
        vatPaid: false,
        mainEngineModel: '',
        mainEngineKw: '',
        numberOfMainEngines: '',
        ecdis: false,
        ballastTanks: false,
        hullMaterial: '',
        superstructureMaterial: '',
        helicopter: false,
        submersible: false,
      });
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedVesselId) {
        await axios.put(`http://localhost:5001/api/vessels/${selectedVesselId}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessage('Vessel updated successfully!');
      } else {
        await axios.post('http://localhost:5001/api/vessels', formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessage('Vessel registered successfully!');
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
        builder: '',
        model: '',
        hullId: '',
        officialNumber: '',
        mmsiNumber: '',
        loa: '',
        netTonnage: '',
        beam: '',
        depth: '',
        waterCapacity: '',
        fuelCapacity: '',
        cruisingSpeed: '',
        maxSpeed: '',
        cruisingRange: '',
        cruisingArea: '',
        usDutyPaid: false,
        vatPaid: false,
        mainEngineModel: '',
        mainEngineKw: '',
        numberOfMainEngines: '',
        ecdis: false,
        ballastTanks: false,
        hullMaterial: '',
        superstructureMaterial: '',
        helicopter: false,
        submersible: false,
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
      {(formMode === 'add' || formMode === 'update') && (
        <form onSubmit={handleSubmit}>
          {formMode === 'update' && (
            <select onChange={handleVesselChange} value={selectedVesselId}>
              <option value="">Select a vessel</option>
              {vessels.map((vessel) => (
                <option key={vessel._id} value={vessel._id}>
                  {vessel.name}
                </option>
              ))}
            </select>
          )}
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
          
          {/* Conditionally render the 'Type of Registration' field */}
          {formData.typeOfVessel === 'Yacht' && (
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
          )}
          
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
          {/* Additional fields */}
          <input
            type="text"
            name="builder"
            value={formData.builder}
            onChange={handleChange}
            placeholder="Builder"
          />
          <input
            type="text"
            name="model"
            value={formData.model}
            onChange={handleChange}
            placeholder="Model"
          />
          <input
            type="text"
            name="hullId"
            value={formData.hullId}
            onChange={handleChange}
            placeholder="Hull ID"
          />
          <input
            type="text"
            name="officialNumber"
            value={formData.officialNumber}
            onChange={handleChange}
            placeholder="Official Number"
          />
          <input
            type="text"
            name="mmsiNumber"
            value={formData.mmsiNumber}
            onChange={handleChange}
            placeholder="MMSI #"
          />
          <input
            type="number"
            name="loa"
            value={formData.loa}
            onChange={handleChange}
            placeholder="LOA (meters)"
          />
          <input
            type="number"
            name="netTonnage"
            value={formData.netTonnage}
            onChange={handleChange}
            placeholder="Net Tonnage"
          />
          <input
            type="number"
            name="beam"
            value={formData.beam}
            onChange={handleChange}
            placeholder="Beam"
          />
          <input
            type="number"
            name="depth"
            value={formData.depth}
            onChange={handleChange}
            placeholder="Depth"
          />
          <input
            type="number"
            name="waterCapacity"
            value={formData.waterCapacity}
            onChange={handleChange}
            placeholder="Water Capacity (liters)"
          />
          <input
            type="number"
            name="fuelCapacity"
            value={formData.fuelCapacity}
            onChange={handleChange}
            placeholder="Fuel Capacity (liters)"
          />
          <input
            type="number"
            name="cruisingSpeed"
            value={formData.cruisingSpeed}
            onChange={handleChange}
            placeholder="Cruising Speed (Knots)"
          />
          <input
            type="number"
            name="maxSpeed"
            value={formData.maxSpeed}
            onChange={handleChange}
            placeholder="Max Speed (Knots)"
          />
          <input
            type="number"
            name="cruisingRange"
            value={formData.cruisingRange}
            onChange={handleChange}
            placeholder="Cruising Range (Nautical Miles)"
          />
          <select
            name="cruisingArea"
            value={formData.cruisingArea}
            onChange={handleChange}
          >
            <option value="">Select Cruising Area</option>
            <option value="USA">USA</option>
            <option value="Bahamas">Bahamas</option>
            <option value="Caribbean">Caribbean</option>
            <option value="Mediterranean">Mediterranean</option>
            <option value="Canada">Canada</option>
            <option value="South Pacific">South Pacific</option>
          </select>
          <label>
            <input
              type="checkbox"
              name="usDutyPaid"
              checked={formData.usDutyPaid}
              onChange={handleChange}
            />
            US Duty Paid
          </label>
          <label>
            <input
              type="checkbox"
              name="vatPaid"
              checked={formData.vatPaid}
              onChange={handleChange}
            />
            VAT Paid
          </label>
          <input
            type="text"
            name="mainEngineModel"
            value={formData.mainEngineModel}
            onChange={handleChange}
            placeholder="Main Engine Model"
          />
          <input
            type="number"
            name="mainEngineKw"
            value={formData.mainEngineKw}
            onChange={handleChange}
            placeholder="Main Engine kW"
          />
          <input
            type="number"
            name="numberOfMainEngines"
            value={formData.numberOfMainEngines}
            onChange={handleChange}
            placeholder="Number of Main Engines"
          />
          <label>
            <input
              type="checkbox"
              name="ecdis"
              checked={formData.ecdis}
              onChange={handleChange}
            />
            ECDIS
          </label>
          <label>
            <input
              type="checkbox"
              name="ballastTanks"
              checked={formData.ballastTanks}
              onChange={handleChange}
            />
            Ballast Tanks
          </label>
          <input
            type="text"
            name="hullMaterial"
            value={formData.hullMaterial}
            onChange={handleChange}
            placeholder="Hull Material"
          />
          <input
            type="text"
            name="superstructureMaterial"
            value={formData.superstructureMaterial}
            onChange={handleChange}
            placeholder="Superstructure Material"
          />
          <label>
            <input
              type="checkbox"
              name="helicopter"
              checked={formData.helicopter}
              onChange={handleChange}
            />
            Helicopter
          </label>
          <label>
            <input
              type="checkbox"
              name="submersible"
              checked={formData.submersible}
              onChange={handleChange}
            />
            Submersible
          </label>
          <button type="submit">
            {formMode === 'add' ? 'Register Vessel' : 'Update Vessel'}
          </button>
        </form>
      )}
    </div>
  );
};

export default VesselFormComponent;
