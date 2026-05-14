import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useAlert } from '../../context/AlertContext';
import { User, Mail, Lock, ShieldCheck, ArrowRight } from 'lucide-react';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { showAlert } = useAlert();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      showAlert("Passwords do not match", "error");
      return;
    }
    
    setLoading(true);
    try {
      await register(formData.name, formData.email, formData.password);
      showAlert('Account created successfully!', 'success');
      navigate('/'); // Redirect to role-based landing
    } catch (err) {
      showAlert(err || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass-card animate-scale-in">
        <div className="auth-header">
          <div className="auth-logo">
            <ShieldCheck size={40} className="text-primary" />
          </div>
          <h1>Join NetPulse</h1>
          <p className="text-muted">Create your account to manage your Wi-Fi services.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label className="input-label">Full Name</label>
            <div className="input-with-icon">
              <User size={18} />
              <input 
                type="text" name="name" placeholder="John Doe" 
                className="input-field" required 
                onChange={handleChange} value={formData.name}
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} />
              <input 
                type="email" name="email" placeholder="john@example.com" 
                className="input-field" required 
                onChange={handleChange} value={formData.email}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="input-group">
               <label className="input-label">Password</label>
               <div className="input-with-icon">
                 <Lock size={18} />
                 <input 
                   type="password" name="password" placeholder="••••••••" 
                   className="input-field" required 
                   onChange={handleChange} value={formData.password}
                 />
               </div>
             </div>
             <div className="input-group">
               <label className="input-label">Confirm Password</label>
               <div className="input-with-icon">
                 <Lock size={18} />
                 <input 
                   type="password" name="confirmPassword" placeholder="••••••••" 
                   className="input-field" required 
                   onChange={handleChange} value={formData.confirmPassword}
                 />
               </div>
             </div>
          </div>

          <button type="submit" className="btn btn-primary w-full py-3 flex items-center justify-center gap-2" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up Now'}
            {!loading && <ArrowRight size={18} />}
          </button>

          <p className="auth-footer text-center mt-6">
            Already have an account? <Link to="/login" className="text-primary font-bold hover:underline">Log In</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
