import React from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div>
      <h1>AI Attorney</h1>
      <Link to="/upload">Upload and process a file</Link>
      <br />
      <Link to="/chat">Chat with an AI attorney</Link>
    </div>
  );
}

export default HomePage;
