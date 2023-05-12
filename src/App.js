import React, { useState } from 'react';
import axios from 'axios';
import { BeatLoader } from 'react-spinners';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [fileSizeKb, setFileSizeKb] = useState(0);
  const [question, setQuestion] = useState('');
  const [location, setLocation] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    const fileSizeInKb = selectedFile.size / 1024; // Get the file size in kilobytes
    setFileSizeKb(fileSizeInKb);
  };

  const handleQuestionChange = (event) => {
    setQuestion(event.target.value);
  };

  const handleLocationChange = (event) => {
    setLocation(event.target.value);
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setAnswer('');
    setIsLoading(true);

    let interval;
    if (file) { // Only setup the progress interval when there's a file
      const estimatedTime = (fileSizeKb / 1024) * 100; // 1 MB is approx. 90 seconds
      // Set an interval to update the progress bar
      interval = setInterval(() => {
        setProgress((oldProgress) => {
          if (oldProgress >= 100) {
            return 100;
          }
          const newProgress = oldProgress + 100 / estimatedTime;
          return Math.min(newProgress, 100);
        });
      }, 1000);
    }

    const formData = new FormData();
    if (file) {
      formData.append('file', file);
    }
    formData.append('question', question);
    formData.append('location', location);

    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/process-pdf`, formData);
      setAnswer(response.data.answer);
      setProgress(0);
      clearInterval(interval);
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setIsLoading(false); // make sure to set loading to false in case of an error
      clearInterval(interval); // also clear the interval in case of an error
    }
  };

  return (
    <div className="App" style={{ padding: '10px', fontFamily: 'Arial' }}>
      <h1 style={{ textAlign: 'center', color: '#444' }}>AI Attorney</h1>
      <form
        onSubmit={handleFormSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          maxWidth: '300px',
          margin: 'auto',
        }}
      >
        <label htmlFor="file">
          PDF (optional):
          <input
            type="file"
            onChange={handleFileChange}
            style={{ margin: '10px 0' }}
            id="file"
          />
        </label>
        <label htmlFor="question">
          Question:
          <textarea
            value={question}
            onChange={handleQuestionChange}
            required
            rows={5}
            style={{
              margin: '10px 0',
              padding: '10px',
              width: '100%',
              borderRadius: '5px',
              border: '1px solid #ccc',
              fontSize: '16px',
              resize: 'vertical',
            }}
            id="question"
          />
        </label>

        <label htmlFor="location">
          Location:
          <input
            type="text"
            value={location}
            onChange={handleLocationChange}
            required
            style={{ margin: '10px 0', padding: '5px' }}
            id="location"
          />
        </label>
        <input
          type="submit"
          value="Submit"
          style={{
            margin: '20px 0',
            padding: '10px',
            background: '#007BFF',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        />
      </form>
      {isLoading && !file && (
        <div style={{ textAlign: 'center', marginTop: '10px', color: '#999' }}>
          <p>Processing your request...</p>
          <BeatLoader color="#007BFF" />
        </div>
      )}

      {isLoading && file && !answer && (
        <div style={{ textAlign: 'center', marginTop: '10px', color: '#999' }}>
          <p>Processing... This may take several minutes depending on the document size.</p>
          <progress
            value={progress}
            max="100"
            style={{
              width: '25%',
              appearance: 'none',
              height: '50px',
              color: '#007BFF', // Change color to your preference
            }}
          />
        </div>
      )}

      {answer && (
        <p
          style={{
            marginTop: '20px',
            border: '1px solid #ddd',
            padding: '10px',
            borderRadius: '5px',
          }}
        >
          {`Answer: ${answer}`}
        </p>
      )}
    </div>
  );
}

export default App;
