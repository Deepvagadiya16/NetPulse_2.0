import React, { createContext, useEffect, useState } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('wifi_user');

    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('wifi_user');
      }
    }

    setLoading(false);
  }, []);

  const loginSelection = async (email, password) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/login', { email, password });
      const userData = response.data;

      // Ensure userData has required fields
      if (!userData || !userData.token || !userData.role) {
        throw new Error('Invalid response format from server');
      }

      localStorage.setItem('wifi_user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Login error:', error);
      throw error.response?.data?.message || error.message || 'Login failed';
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/register', { name, email, password });
      const userData = response.data;

      localStorage.setItem('wifi_user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (error) {
      throw error.response?.data?.message || 'Registration failed';
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('wifi_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login: loginSelection, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
