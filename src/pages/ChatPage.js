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
  const [chatHistoryForServer, setChatHistoryForServer] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [isFirstQuestion, setIsFirstQuestion] = useState(true);

  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    const userMessage = { role: 'user', content: message };
    let messageToSend = message;

    if (isFirstQuestion) {
      messageToSend = `You are an expert attorney. Give your answer on the following question: ${message}. If the location isn't provided, ask me for the location/jurisdiction.`;
      setIsFirstQuestion(false);
    }

    setChatHistory((oldChatHistory) => [...oldChatHistory, userMessage]);
    setChatHistoryForServer((oldChatHistory) => [...oldChatHistory, { role: 'user', content: messageToSend }]);
    setIsSending(true);

    try {
      const lastMessages = chatHistoryForServer.slice(-11); // Get the last 3 messages
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/chat`, { messages: [...lastMessages, { role: 'user', content: messageToSend }] });
      setChatHistory((oldChatHistory) => [...oldChatHistory, { role: 'assistant', content: response.data.answer }]);
      setChatHistoryForServer((oldChatHistory) => [...oldChatHistory, { role: 'assistant', content: response.data.answer }]);
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
