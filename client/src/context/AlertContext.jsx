import React, { createContext, useState, useContext, useCallback } from 'react';
import './Alert.css';

const AlertContext = createContext();

export const useAlert = () => useContext(AlertContext);

export const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState(null);

  const showAlert = useCallback((message, type = 'info') => {
    setAlert({ message, type });
    // Auto-hide after 5 seconds
    setTimeout(() => {
      setAlert(null);
    }, 5000);
  }, []);

  const hideAlert = useCallback(() => {
    setAlert(null);
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      {alert && <AlertComponent message={alert.message} type={alert.type} onClose={hideAlert} />}
    </AlertContext.Provider>
  );
};

// Internal component for the actual UI
const AlertComponent = ({ message, type, onClose }) => {
  return (
    <div className={`app-alert-overlay`}>
      <div className={`app-alert glass-card alert-${type} animate-fade-in`}>
        <div className="alert-content">
          <p>{message}</p>
        </div>
        <button className="alert-close" onClick={onClose}>&times;</button>
      </div>
    </div>
  );
};
