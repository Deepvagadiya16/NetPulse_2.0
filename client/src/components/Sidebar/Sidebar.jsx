import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Wifi, LayoutDashboard, Users, CreditCard, Wrench, FileText, LogOut, FileWarning, LifeBuoy, CheckCircle } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminLinks = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Customers', path: '/admin/customers', icon: Users },
    { name: 'Plans', path: '/admin/plans', icon: Wifi },
    { name: 'Billing', path: '/admin/billing', icon: CreditCard },
    { name: 'Subscriptions', path: '/admin/subscriptions', icon: CheckCircle },
    { name: 'Employees', path: '/admin/employees', icon: Wrench },
    { name: 'Complaints', path: '/admin/complaints', icon: FileWarning },
    { name: 'Reports', path: '/admin/reports', icon: FileText },
  ];

  const customerLinks = [
    { name: 'Dashboard', path: '/customer', icon: LayoutDashboard },
    { name: 'My Plan', path: '/customer/plan', icon: Wifi },
    { name: 'Payments', path: '/customer/payments', icon: CreditCard },
    { name: 'Support', path: '/customer/support', icon: LifeBuoy },
  ];

  const techLinks = [
    { name: 'Dashboard', path: '/technician', icon: LayoutDashboard },
    { name: 'My Tasks', path: '/technician/tasks', icon: Wrench },
  ];

  let links = [];
  if (user.role === 'Admin') links = adminLinks;
  else if (user.role === 'Customer') links = customerLinks;
  else if (user.role === 'Technician') links = techLinks;

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-logo">
          <Wifi size={28} className="text-primary" />
        </div>
        <h2 className="brand-text text-gradient">NetPulse</h2>
      </div>

      <nav className="sidebar-nav">
        {links.map((link, idx) => (
          <NavLink 
            key={idx} 
            to={link.path}
            end={link.path === '/admin' || link.path === '/customer' || link.path === '/technician'}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <link.icon size={20} className="nav-icon" />
            <span>{link.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="logout-btn">
          <LogOut size={20} className="nav-icon text-danger" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
