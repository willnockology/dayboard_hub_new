import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

function ChatComponent() {
  const { documentId } = useParams();
  const [chats, setChats] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/api/chats/${documentId}`);
        setChats(response.data);
      } catch (error) {
        console.error('Error fetching chats:', error);
      }
    };
    fetchChats();
  }, [documentId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5001/api/chats', {
        documentId,
        userId: 'current_user_id',  // Replace with the actual user ID
        message,
      });
      setChats([...chats, response.data]);
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div>
      <h2>Chat for Document {documentId}</h2>
      <ul>
        {chats.map(chat => (
          <li key={chat._id}>{chat.userId.username}: {chat.message}</li>
        ))}
      </ul>
      <form onSubmit={handleSubmit}>
        <div>
          <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} />
          <button type="submit">Send</button>
        </div>
      </form>
    </div>
  );
}

export default ChatComponent;
