import React, { useState } from 'react';
import axios from 'axios';
import './ChatPage.css'; // Add this line to import styles

// Define Spinner outside of the ChatPage
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
    <div>
      <h1>Chat with an AI attorney</h1>
      <div>
        {chatHistory.map((chat) => ( // remove 'index'
          <div key={chat.id}>
            <strong>{chat.role === 'user' ? 'You: ' : 'Assistant: '}</strong>
            {chat.role === 'assistant' && isSending ? (
              <Spinner /> // replace this with your loading animation
            ) : (
              chat.content
            )}
          </div>
        ))}
        {isSending && <p>Sending...</p>}
      </div>
      <form onSubmit={handleFormSubmit}>
        <input type="text" value={message} onChange={handleMessageChange} required />
        <input type="submit" value="Send" disabled={isSending} />
      </form>
    </div>
  );
}

export default ChatPage;
