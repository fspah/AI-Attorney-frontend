import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import './ChatPage.css';

function Spinner() {
  return (
    <div className="spinner">
      <div className="double-bounce1" />
      <div className="double-bounce2" />
    </div>
  );
}

function ChatMessage({ message }) {
  const isUser = message.role === 'user';
  const messageClass = isUser ? 'chat-message-user' : 'chat-message-assistant';

  return (
    <div className={`chat-message ${messageClass}`}>
      {message.content}
    </div>
  );
}
ChatMessage.propTypes = {
  message: PropTypes.shape({
    role: PropTypes.string,
    content: PropTypes.string,
  }).isRequired,
};

function ChatInput({
  onMessageChange, message, isSending, onFormSubmit,
}) {
  return (
    <form className="chat-input-form" onSubmit={onFormSubmit}>
      <input className="chat-input" type="text" value={message} onChange={onMessageChange} required style={{ fontSize: '18px' }} />
      <button type="submit" className="chat-submit" disabled={isSending}>
        {isSending ? 'Sending...' : 'Send'}
      </button>
    </form>
  );
}

ChatInput.propTypes = {
  onMessageChange: PropTypes.func.isRequired,
  message: PropTypes.string.isRequired,
  isSending: PropTypes.bool.isRequired,
  onFormSubmit: PropTypes.func.isRequired,
};

function DocumentUploadLink() {
  return (
    <Link
      to="/upload"
      className="upload-link"
      onMouseOver={(e) => { e.target.style.backgroundColor = '#0056b3'; }}
      onMouseOut={(e) => { e.target.style.backgroundColor = '#007BFF'; }}
    >
      Ask questions about a legal document with an AI Attorney
    </Link>
  );
}

function ChatPage() {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [chatHistoryForServer, setChatHistoryForServer] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const chatBoxRef = useRef(null);
  const [errorr, setError] = useState(null);

  useEffect(() => {
    const systemMessage = {
      role: 'user',
      content: "You are an expert attorney. Answer the question. If the location isn't provided, ask me for the location/jurisdiction.",
    };
    setChatHistoryForServer([systemMessage]);
  }, []);
  useEffect(() => {
    // Scroll the chat box to the bottom when a new message is added
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    const userMessage = { role: 'user', content: message };

    const newChatHistoryForServer = [...chatHistoryForServer, userMessage];

    setChatHistory((oldChatHistory) => [...oldChatHistory, userMessage]);
    setChatHistoryForServer(newChatHistoryForServer);
    setIsSending(true);

    try {
      // console.log(newChatHistoryForServer);
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/chat`, { messages: newChatHistoryForServer });
      const assistantMessage = { role: 'assistant', content: response.data.answer };
      setChatHistory((oldChatHistory) => [...oldChatHistory, assistantMessage]);
      setChatHistoryForServer((oldChatHistory) => [...oldChatHistory, assistantMessage]);
      setMessage('');
    } catch (error) {
      setError('Oops! Something went wrong, please try again.');
    }

    setIsSending(false);
  };

  return (
    <div className="chat-container">
      <h1>Chat with an AI Attorney</h1>
      <div className="chat-box" ref={chatBoxRef}>
        {errorr && <p className="error-message">{errorr}</p>}
        {chatHistory.map((chat) => (
          <ChatMessage key={`${chat.role}-${chat.content}`} message={chat} />
        ))}
        {isSending && <Spinner />}
        {' '}
        {/* Now the spinner will be displayed when isSending is true */}
      </div>
      <ChatInput
        onMessageChange={handleMessageChange}
        message={message}
        isSending={isSending}
        onFormSubmit={handleFormSubmit}
      />
      <DocumentUploadLink />
    </div>
  );
}

export default ChatPage;
