import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Search, User } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <header className="navbar">


      <div className="navbar-actions">
        <div className="user-profile">
          <div className="avatar">
            <User size={20} className="text-primary" />
          </div>
          <div className="user-info">
            <span className="user-name">{user.username}</span>
            <span className="user-role badge badge-primary">{user.role}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
