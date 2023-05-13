import React, { useState } from 'react';
import axios from 'axios';

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
      // eslint-disable-next-line no-console
      console.error(error);
    }
  };

  return (
    <div>
      <h1>Chat with an AI attorney</h1>
      <div>
        {chatHistory.map((chat, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <div key={`${chat.role}-${index}`}>
            <strong>{chat.role === 'user' ? 'You: ' : 'Assistant: '}</strong>
            {chat.content}
          </div>
        ))}
      </div>
      <form onSubmit={handleFormSubmit}>
        <input type="text" value={message} onChange={handleMessageChange} required />
        <input type="submit" value="Send" />
      </form>
    </div>
  );
}

export default ChatPage;
