import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ChatComponent.css';

function ChatComponent({ documentId, itemName }) {
  const [chats, setChats] = useState([]);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(`http://localhost:5001/api/chats/${documentId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setChats(response.data);
      } catch (error) {
        console.error('Error fetching chats:', error);
      }
    };
    fetchChats();
  }, [documentId]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      console.log('Stored user:', parsedUser);  // Log stored user data
      setUser(parsedUser);
    } else {
      console.error('No user found in local storage');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      console.error('User not found in local storage');
      return;
    }

    const payload = {
      documentId,
      userId: user._id || user.id,  // Ensure we are accessing the correct property
      message,
    };

    if (!payload.userId) {
      console.error('User ID is undefined:', user);
      return;
    }

    console.log('Sending chat request:', payload);

    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post('http://localhost:5001/api/chats', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Chat response:', response.data);
      setChats([...chats, response.data]);
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error.response ? error.response.data : error.message);
    }
  };

  return (
    <div className="chat-container">
      <h2>Comments for {itemName}</h2>
      <table className="chat-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Comment</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {chats.map(chat => (
            <tr key={chat._id}>
              <td>{chat.userId.firstName} {chat.userId.lastName}</td>
              <td>{chat.message}</td>
              <td>{new Date(chat.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <form onSubmit={handleSubmit}>
        <div className="chat-input-container">
          <input 
            type="text" 
            value={message} 
            onChange={(e) => setMessage(e.target.value)} 
            required 
          />
          <button type="submit">Send</button>
        </div>
      </form>
    </div>
  );
}

export default ChatComponent;
