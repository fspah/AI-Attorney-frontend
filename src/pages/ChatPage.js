import React, { useState } from 'react';
import axios from 'axios';
import './ChatPage.css';

function Spinner() {
  return (
    <div className="spinner">
      <div className="double-bounce1" />
      <div className="double-bounce2" />
    </div>
  );
}

function ChatPage() {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isSending, setIsSending] = useState(false);

  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    setChatHistory((oldChatHistory) => [...oldChatHistory, { role: 'user', content: message }]);
    setIsSending(true);

    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/chat`, { prompt: message });
      setChatHistory((oldChatHistory) => [...oldChatHistory, { role: 'assistant', content: response.data.answer }]);
      setMessage('');
    } catch (error) {
      console.error(error);
    }

    setIsSending(false);
  };

  return (
    <div className="chat-container">
      <h1>Chat with an AI attorney</h1>
      <div className="chat-box">
        {chatHistory.map((chat) => (
          <div className={`chat-message ${chat.role}`} key={chat.id}>
            {chat.content}
          </div>
        ))}
      </div>
      <form className="chat-input-form" onSubmit={handleFormSubmit}>
        <input className="chat-input" type="text" value={message} onChange={handleMessageChange} required />
        <input className="chat-submit" type="submit" value="Send" disabled={isSending} />
        {isSending && (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Spinner />
            <p>Sending...</p>
          </div>
        )}
      </form>
    </div>
  );
}

export default ChatPage;
