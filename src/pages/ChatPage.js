import React, { useState, useEffect } from 'react';
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
  const [chatHistoryForServer, setChatHistoryForServer] = useState([]);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const systemMessage = {
      role: 'system',
      content: "You are an expert attorney. If the location isn't provided, ask me for the location/jurisdiction.",
    };
    setChatHistoryForServer([systemMessage]);
  }, []);

  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    const userMessage = { role: 'user', content: message };

    setChatHistory((oldChatHistory) => [...oldChatHistory, userMessage]);
    setChatHistoryForServer((oldChatHistory) => [...oldChatHistory, userMessage]);
    setIsSending(true);

    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/chat`, { messages: chatHistoryForServer });
      const assistantMessage = { role: 'assistant', content: response.data.answer };
      setChatHistory((oldChatHistory) => [...oldChatHistory, assistantMessage]);
      setChatHistoryForServer((oldChatHistory) => [...oldChatHistory, assistantMessage]);
      setMessage('');
    } catch (error) {
      // Handling error
    }

    setIsSending(false);
  };

  return (
    <div className="chat-container">
      <h1>Chat with an AI attorney</h1>
      <div className="chat-box">
        {chatHistory.map((chat, index) => (
          <div className={`chat-message ${chat.role}`} key={`${chat.role}-${index}`}>
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
