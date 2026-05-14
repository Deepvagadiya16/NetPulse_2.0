import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useAlert } from '../../context/AlertContext';
import { Wifi, Mail, Lock } from 'lucide-react';
import './Auth.css';

const Login = () => {
  const { login } = useAuth();
  const { showAlert } = useAlert();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Hardcoded credentials for showcase based on PDF structure logic
  const [formData, setFormData] = useState({ email: 'admin@netpulse.com', password: 'admin' });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userData = await login(formData.email, formData.password);
      
      if (!userData || !userData.role) {
        throw new Error('Invalid user data received');
      }

      showAlert('Welcome back to NetPulse!', 'success');
      
      // Explicit navigation to role-based dashboard
      const redirectPath = `/${userData.role.toLowerCase()}`;
      navigate(redirectPath, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      showAlert(err || 'Invalid login coordinates', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="glow-sphere"></div>
        <div className="glow-sphere glow-sphere-alt"></div>
      </div>
      
      <div className="auth-card glass-card animate-fade-in">
        <div className="auth-header">
          <div className="brand-logo-large">
            <Wifi size={40} className="text-primary" />
          </div>
          <h1>Welcome to <span className="text-gradient">NetPulse</span></h1>
          <p className="text-muted">Enter your credentials to access the system</p>
        </div>

        <div className="auth-demo-hint">
          <p><strong>Demo Roles:</strong></p>
          <p>Admin: admin@ / Customer: user@ / Tech: tech@</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label className="input-label">Email Address</label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" />
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field with-icon" 
                placeholder="Ex. admin@netpulse.com" 
                required 
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label flex justify-between">
              Password
              <a href="#" className="forgot-link">Forgot?</a>
            </label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input 
                type="password" 
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input-field with-icon" 
                placeholder="••••••••" 
                required 
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full mt-4" disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>

          <p className="auth-footer text-center mt-6">
            Don't have an account? <Link to="/register" className="text-primary font-bold hover:underline">Sign Up</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
