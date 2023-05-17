import React, { useState } from 'react';
import axios from 'axios';
import './ChatPage.css'; // Add this line to import styles

function ChatPage() {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);

  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/chat`, { prompt: message });
      setChatHistory((oldChatHistory) => [...oldChatHistory, { role: 'user', content: message }, { role: 'assistant', content: response.data.answer }]);
      setMessage('');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="chat-container">
      <h1>Chat with an AI attorney</h1>
      <div className="chat-box">
        {chatHistory.map((chat, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <div key={`${chat.role}-${index}-${Date.now()}`} className={`chat-message ${chat.role}`}>
            <strong>{chat.role === 'user' ? 'You: ' : 'Assistant: '}</strong>
            {chat.content}
          </div>
        ))}
      </div>
      <form onSubmit={handleFormSubmit} className="chat-input-form">
        <input type="text" value={message} onChange={handleMessageChange} required className="chat-input" />
        <input type="submit" value="Send" className="chat-submit" />
      </form>
    </div>
  );
}

export default ChatPage;
