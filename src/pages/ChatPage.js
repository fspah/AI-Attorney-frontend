import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import './ChatPage.css';
import { makeStyles } from '@material-ui/core/styles';
import {
  TextField, Button, CircularProgress, Typography, Box, Grid, Card, CardContent,
} from '@material-ui/core';
import SendIcon from '@material-ui/icons/Send';

/* function Spinner() {
  return (
    <div className="spinner">
      <div className="double-bounce1" />
      <div className="double-bounce2" />
    </div>
  );
} */

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
        {isSending ? 'Send' : 'Send'}
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

const useStyles = makeStyles((theme) => ({
  chatContainer: {
    marginTop: theme.spacing(2),
  },
  chatCard: {
    height: '70vh',
    overflowY: 'auto',
    marginBottom: theme.spacing(2),
    backgroundColor: '#f3f8fb',
    border: '1px solid #e0e0e0',
    borderRadius: 15,
  },
  chatInputForm: {
    display: 'flex',
    alignItems: 'flex-end',
  },
  chatInput: {
    flex: 1,
    marginRight: theme.spacing(2),
  },
  sendButton: {
    padding: theme.spacing(1),
  },
  messageCard: {
    marginBottom: theme.spacing(2),
    padding: theme.spacing(1),
    borderRadius: 15,
  },
  userMessage: {
    backgroundColor: '#e6f7ff',
    color: '#08979c',
  },
  assistantMessage: {
    backgroundColor: '#fffbe6',
    color: '#874d00',
  },
}));

function ChatPage() {
  const classes = useStyles();
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
    <Grid container justify="center" className={classes.chatContainer}>
      <Grid item xs={12} sm={8} md={6}>
        <Box mb={2}>
          <Typography variant="h5" align="center">
            Chat with an AI Attorney
          </Typography>
        </Box>
        <Card className={classes.chatCard}>
          {errorr && <p className="error-message">{errorr}</p>}
          {chatHistory.map((chat, i) => (
            <CardContent
            // eslint-disable-next-line react/no-array-index-key
              key={`${chat.role}-${i}`}
              className={`${classes.messageCard} ${chat.role === 'user' ? classes.userMessage : classes.assistantMessage}`}
            >
              <Typography>{chat.content}</Typography>
            </CardContent>
          ))}
          {isSending && <CircularProgress className={classes.spinner} />}
        </Card>
        <form className={classes.chatInputForm} onSubmit={handleFormSubmit}>
          <TextField
            className={classes.chatInput}
            variant="outlined"
            type="text"
            value={message}
            onChange={handleMessageChange}
            required
          />
          <Button
            className={classes.sendButton}
            variant="contained"
            color="primary"
            type="submit"
            disabled={isSending}
            endIcon={<SendIcon />}
          >
            Send
          </Button>
        </form>
        <DocumentUploadLink />
      </Grid>
    </Grid>
  );
}

export default ChatPage;
