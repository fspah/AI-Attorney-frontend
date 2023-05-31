import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import '../App.css';
import './ChatPage.css';

function Spinner() {
  return (
    <div className="spinner">
      <div className="double-bounce1" />
      <div className="double-bounce2" />
    </div>
  );
}

function UploadPage() {
  const [file, setFile] = useState(null);
  const [filename, setFilename] = useState('');
  const [fileSizeKb, setFileSizeKb] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [chatHistoryForServer, setChatHistoryForServer] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const chatBoxRef = useRef(null);
  const [uploadStatus, setUploadStatus] = useState(false);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setFilename(selectedFile.name);
    const fileSizeInKb = selectedFile.size / 1024; // Get the file size in kilobytes
    setFileSizeKb(fileSizeInKb);
  };

  const handleFileUpload = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setUploadStatus(false);

    let interval;
    if (file) { // Only setup the progress interval when there's a file
      const estimatedTime = (fileSizeKb / 1024) * 90; // 1 MB is approx. 90 seconds
      // Set an interval to update the progress bar
      interval = setInterval(() => {
        setProgress((oldProgress) => {
          if (oldProgress >= 100) {
            clearInterval(interval);
            return 100;
          }
          const newProgress = oldProgress + 100 / estimatedTime;
          return Math.min(newProgress, 100);
        });
      }, 1000);

      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/upload-file`, formData);
        setFilename(response.data.filename);
        setProgress(0);
        setIsLoading(false);
        clearInterval(interval);
        setUploadStatus(true);
      } catch (error) {
        console.error(error);
        setIsLoading(false);
        clearInterval(interval);
      }
    }
  };
  useEffect(() => {
    // The initial system message
    /*     const systemMessage = {
      role: 'user',
      content: 'You are an expert attorney.
        Use the following pieces of context to answer the message at the end. ',
    };
    setChatHistoryForServer([systemMessage]);
 */
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
    setChatHistory((oldChatHistory) => [...oldChatHistory, userMessage]);
    setIsSending(true);
    const newChatHistory = [...chatHistoryForServer, userMessage];
    setChatHistoryForServer(newChatHistory);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/process-pdf`,
        {
          messages: newChatHistory,
          filename,
        },
      );
      const assistantMessage = { role: 'assistant', content: response.data.answer };
      setChatHistory((oldChatHistory) => [...oldChatHistory, assistantMessage]);
      setChatHistoryForServer((oldChatHistory) => [...oldChatHistory, assistantMessage]);
      setMessage('');
    } catch (error) {
      // Handle error
    }

    setIsSending(false);
  };

  /*  const handleQuestionSubmit = async (event) => {
    event.preventDefault();
    setIsQuestionLoading(true);

    const estimatedTime = 15;
    const interval = setInterval(() => {
      setQuestionProgress((oldProgress) => {
        if (oldProgress >= 100) {
          clearInterval(interval);
          return 100;
        }
        const newProgress = oldProgress + 100 / estimatedTime;
        return Math.min(newProgress, 100);
      });
    }, 1000);

    const formData = new FormData();
    formData.append('filename', filename);
    formData.append('question', question);

    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/process-pdf`,
      formData);
      setAnswer(response.data.answer);
      setQuestionProgress(0);
      clearInterval(interval);
      setIsQuestionLoading(false);
    } catch (error) {
      console.error(error);
      setIsQuestionLoading(false); // make sure to set loading to false in case of an error
      clearInterval(interval); // also clear the interval in case of an error
    }
  }; */

  return (
    <div
      className="App"
      style={{
        padding: '10px',
        fontFamily: 'Arial',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        border: '1px solid #e9ecef',
        borderRadius: '5px',
        maxWidth: '600px',
        margin: 'auto',
      }}
    >
      <h1 style={{ marginBottom: '20px' }}>AI Attorney</h1>
      <form
        onSubmit={handleFileUpload}
        style={{
          display: 'flex',
          flexDirection: 'column',
          maxWidth: '300px',
        }}
      >
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%',
        }}
        >
          <span>PDF:</span>
          <label
            htmlFor="file"
            style={{
              display: 'inline-block',
              padding: '10px 20px',
              background: '#007BFF',
              color: '#fff',
              cursor: 'pointer',
              borderRadius: '5px',
              marginTop: '10px',
            }}
          >
            Browse File...
            <input
              type="file"
              onChange={handleFileChange}
              id="file"
              style={{
                position: 'absolute',
                left: '-9999px', // This will hide the input field off-screen
              }}
            />
          </label>
          {filename && (
          <div style={{
            marginTop: '10px',
            fontSize: '14px',
            color: '#333',
          }}
          >
            Selected file:
            {' '}
            {filename}
          </div>
          )}
        </div>

        <input
          type="submit"
          value="Upload"
          disabled={!file}
          style={{
            margin: '20px 0',
            padding: '10px',
            background: '#007BFF',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px',
          }}
        />
      </form>
      {isLoading && (
      <div style={{ textAlign: 'center', marginTop: '10px', color: '#999' }}>
        <p>Uploading... This may take several minutes depending on the document size.</p>
        <progress
          value={progress}
          max="100"
          style={{
            width: '100%',
            appearance: 'none',
            height: '50px',
            color: '#007BFF',
          }}
        />
      </div>
      )}
      {filename && uploadStatus && !isLoading && (
      <div className="chat-container">
        <div className="chat-box" ref={chatBoxRef}>
          {chatHistory.map((chat, index) => (
          // eslint-disable-next-line
          <div className={`chat-message ${chat.role}`} key={`${chat.role}-${index}`}>
            {chat.content}
          </div>
          ))}
        </div>
        <form className="chat-input-form" onSubmit={handleFormSubmit}>
          <input className="chat-input" type="text" value={message} onChange={handleMessageChange} required style={{ fontSize: '18px' }} />
          <input className="chat-submit" type="submit" value="Send" disabled={isSending} />
          {isSending && (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Spinner />
            <p>Processing...</p>
          </div>
          )}
        </form>
      </div>
      )}
    </div>
  );
}

export default UploadPage;
