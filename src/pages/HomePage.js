import React from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
  const buttonStyle = {
    display: 'inline-block',
    backgroundColor: '#007BFF',
    color: '#fff',
    padding: '10px 20px',
    margin: '10px 0',
    textDecoration: 'none',
    borderRadius: '5px',
    textAlign: 'center',
    transition: 'background-color 0.3s ease',
  };

  return (
    <div style={{ textAlign: 'center', fontFamily: 'Arial' }}>
      <h1>AI Attorney</h1>
      <Link
        to="/upload"
        style={buttonStyle}
        onMouseOver={(e) => { e.target.style.backgroundColor = '#0056b3'; }}
        onMouseOut={(e) => { e.target.style.backgroundColor = '#007BFF'; }}
      >
        Upload and process a file
      </Link>
      <br />
      <Link
        to="/chat"
        style={buttonStyle}
        onMouseOver={(e) => { e.target.style.backgroundColor = '#0056b3'; }}
        onMouseOut={(e) => { e.target.style.backgroundColor = '#007BFF'; }}
      >
        Chat with an AI attorney
      </Link>
    </div>
  );
}

export default HomePage;
