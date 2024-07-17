import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperclip } from '@fortawesome/free-solid-svg-icons';
import './ChatComponent.css';

function ChatComponent({ documentId, itemName, markAsRead }) {
  const [chats, setChats] = useState([]);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);
  const [attachment, setAttachment] = useState(null);

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
        if (markAsRead) {
          markAsRead(documentId);
        }
      } catch (error) {
        console.error('Error fetching chats:', error);
      }
    };
    fetchChats();
  }, [documentId, markAsRead]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
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

    if (message.length > 200) {
      alert('Comment cannot exceed 200 characters.');
      return;
    }

    const formData = new FormData();
    formData.append('documentId', documentId);
    formData.append('userId', user._id || user.id);
    formData.append('message', message);
    if (attachment) {
      formData.append('attachment', attachment);
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post('http://localhost:5001/api/chats', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setChats([...chats, response.data]);
      setMessage('');
      setAttachment(null);
    } catch (error) {
      console.error('Error sending message:', error.response ? error.response.data : error.message);
    }
  };

  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleString('en-GB', options).replace(',', ' at');
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
            <th><FontAwesomeIcon icon={faPaperclip} /></th>
          </tr>
        </thead>
        <tbody>
          {chats.map(chat => (
            <tr key={chat._id}>
              <td>{chat.userId.firstName} {chat.userId.lastName}</td>
              <td>{chat.message}</td>
              <td>{formatDate(chat.createdAt)}</td>
              <td>
                {chat.attachment ? (
                  <a href={`http://localhost:5001/uploads/${chat.attachment}`} target="_blank" rel="noopener noreferrer">
                    <FontAwesomeIcon icon={faPaperclip} />
                  </a>
                ) : (
                  ''
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <form onSubmit={handleSubmit} className="chat-form">
        <div className="chat-input-container">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your comment (max 200 characters)"
            maxLength="200"
            required
          />
          <input
            type="file"
            onChange={(e) => setAttachment(e.target.files[0])}
          />
          <button type="submit">Send</button>
        </div>
      </form>
    </div>
  );
}

export default ChatComponent;
