import React, { useEffect, useState } from 'react';
import axios from 'axios';

function FormAssignmentComponent() {
  const [clients, setClients] = useState([]);
  const [forms, setForms] = useState([]);
  const [assignments, setAssignments] = useState({});

  useEffect(() => {
    const fetchClientsAndForms = async () => {
      try {
        const clientsResponse = await axios.get('http://localhost:5001/api/clients'); // Adjust API endpoint as needed
        const formsResponse = await axios.get('http://localhost:5001/api/forms'); // Adjust API endpoint as needed
        setClients(clientsResponse.data);
        setForms(formsResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchClientsAndForms();
  }, []);

  const handleAssignmentChange = (clientId, formId, isAssigned) => {
    setAssignments({
      ...assignments,
      [clientId]: {
        ...assignments[clientId],
        [formId]: isAssigned,
      },
    });
  };

  const handleSaveAssignments = async () => {
    try {
      await axios.post('http://localhost:5001/api/assignments', assignments); // Adjust API endpoint as needed
      console.log('Assignments saved successfully');
    } catch (error) {
      console.error('Error saving assignments:', error);
    }
  };

  return (
    <div>
      <h2>Form Assignments</h2>
      <table>
        <thead>
          <tr>
            <th>Client</th>
            {forms.map(form => (
              <th key={form._id}>{form.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {clients.map(client => (
            <tr key={client._id}>
              <td>{client.name}</td>
              {forms.map(form => (
                <td key={form._id}>
                  <input
                    type="checkbox"
                    checked={assignments[client._id]?.[form._id] || false}
                    onChange={(e) =>
                      handleAssignmentChange(client._id, form._id, e.target.checked)
                    }
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={handleSaveAssignments}>Save Assignments</button>
    </div>
  );
}

export default FormAssignmentComponent;
