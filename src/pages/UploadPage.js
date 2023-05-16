import React, { useState } from 'react';
import axios from 'axios';
import '../App.css';

function UploadPage() {
  const [file, setFile] = useState(null);
  const [filename, setFilename] = useState('');
  const [fileSizeKb, setFileSizeKb] = useState(0);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isQuestionLoading, setIsQuestionLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [questionProgress, setQuestionProgress] = useState(0);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    const fileSizeInKb = selectedFile.size / 1024; // Get the file size in kilobytes
    setFileSizeKb(fileSizeInKb);
  };

  const handleQuestionChange = (event) => {
    setQuestion(event.target.value);
  };

  const handleFileUpload = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    let interval;
    if (file) { // Only setup the progress interval when there's a file
      const estimatedTime = (fileSizeKb / 1024) * 80; // 1 MB is approx. 90 seconds
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
      } catch (error) {
        console.error(error);
        setIsLoading(false); // make sure to set loading to false in case of an error
        clearInterval(interval); // also clear the interval in case of an error
      }
    }
  };

  const handleQuestionSubmit = async (event) => {
    event.preventDefault();
    setIsQuestionLoading(true);

    const estimatedTime = (fileSizeKb / 1024) * 50; // 20% of file upload time
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
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/process-pdf`, formData);
      setAnswer(response.data.answer);
      setQuestionProgress(0);
      setIsQuestionLoading(false);
      clearInterval(interval);
    } catch (error) {
      console.error(error);
      setIsQuestionLoading(false); // make sure to set loading to false in case of an error
      clearInterval(interval); // also clear the interval in case of an error
    }
  };

  return (
  // Remaining JSX
    <div className="App" style={{ padding: '10px', fontFamily: 'Arial' }}>
      <h1 style={{ textAlign: 'center', color: '#444' }}>AI Attorney</h1>
      <form
        onSubmit={handleFileUpload}
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

        <input
          type="submit"
          value="Upload"
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

      {isLoading && (
      <div style={{ textAlign: 'center', marginTop: '10px', color: '#999' }}>
        <p>Uploading... This may take several minutes depending on the document size.</p>
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

      {filename && !isLoading && (
      <form
        onSubmit={handleQuestionSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          maxWidth: '300px',
          margin: 'auto',
        }}
      >
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
        <input
          type="submit"
          value="Submit Question"
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
      )}

      {isQuestionLoading && (
      <div style={{ textAlign: 'center', marginTop: '10px', color: '#999' }}>
        <p>Processing your question...</p>
        <progress
          value={questionProgress}
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

export default UploadPage;
