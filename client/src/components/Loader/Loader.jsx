import React from 'react';
import './Loader.css';

const Loader = ({ fullScreen = false }) => {
  const content = (
    <div className="loader-container">
      <div className="spinner"></div>
      <p className="loader-text mt-4 text-muted">Loading pulse...</p>
    </div>
  );

  if (fullScreen) {
    return <div className="loader-fullscreen">{content}</div>;
  }

  return content;
};

export default Loader;
