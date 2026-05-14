import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Auth
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';

// Layout
import Sidebar from '../components/Sidebar/Sidebar';
import Navbar from '../components/Navbar/Navbar';

// Admin Pages (Placeholders for now)
import AdminDashboard from '../pages/Admin/Dashboard';
import AdminCustomers from '../pages/Admin/Customers';
import AdminPlans from '../pages/Admin/Plans';
import AdminBilling from '../pages/Admin/Billing';
import AdminEmployees from '../pages/Admin/Employees';
import AdminReports from '../pages/Admin/Reports';
import AdminComplaints from '../pages/Admin/Complaints';
import AdminSubscriptions from '../pages/Admin/Subscriptions';

// Customer Pages
import CustomerDashboard from '../pages/Customer/Dashboard';
import CustomerBilling from '../pages/Customer/Billing';
import CustomerSupport from '../pages/Customer/Support';
import MyPlan from '../pages/Customer/MyPlan';
import Payments from '../pages/Customer/Payments';

// Technician Pages
import TechnicianDashboard from '../pages/Technician/Dashboard';
import TechnicianTasks from '../pages/Technician/Tasks';

function PrivateRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  
  if (loading) return null;
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their respective dashboard if they try to access wrong role
    if (user.role === 'Admin') return <Navigate to="/admin" replace />;
    if (user.role === 'Customer') return <Navigate to="/customer" replace />;
    if (user.role === 'Technician') return <Navigate to="/technician" replace />;
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Navbar />
        <div className="page-wrapper animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to={`/${user.role.toLowerCase()}`} replace />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to={`/${user.role.toLowerCase()}`} replace />} />
      
      {/* Root redirect */}
      <Route path="/" element={<Navigate to={user ? `/${user.role.toLowerCase()}` : "/login"} replace />} />

      {/* Admin Routes */}
      <Route path="/admin" element={<PrivateRoute allowedRoles={['Admin']}><AdminDashboard /></PrivateRoute>} />
      <Route path="/admin/customers" element={<PrivateRoute allowedRoles={['Admin']}><AdminCustomers /></PrivateRoute>} />
      <Route path="/admin/plans" element={<PrivateRoute allowedRoles={['Admin']}><AdminPlans /></PrivateRoute>} />
      <Route path="/admin/billing" element={<PrivateRoute allowedRoles={['Admin']}><AdminBilling /></PrivateRoute>} />
      <Route path="/admin/subscriptions" element={<PrivateRoute allowedRoles={['Admin']}><AdminSubscriptions /></PrivateRoute>} />
      <Route path="/admin/employees" element={<PrivateRoute allowedRoles={['Admin']}><AdminEmployees /></PrivateRoute>} />
      <Route path="/admin/reports" element={<PrivateRoute allowedRoles={['Admin']}><AdminReports /></PrivateRoute>} />
      <Route path="/admin/complaints" element={<PrivateRoute allowedRoles={['Admin']}><AdminComplaints /></PrivateRoute>} />
      
      {/* Customer Routes */}
      <Route path="/customer" element={<PrivateRoute allowedRoles={['Customer']}><CustomerDashboard /></PrivateRoute>} />
      <Route path="/customer/billing" element={<PrivateRoute allowedRoles={['Customer']}><CustomerBilling /></PrivateRoute>} />
      <Route path="/customer/support" element={<PrivateRoute allowedRoles={['Customer']}><CustomerSupport /></PrivateRoute>} />
      <Route path="/customer/plan" element={<PrivateRoute allowedRoles={['Customer']}><MyPlan /></PrivateRoute>} />
      <Route path="/customer/payments" element={<PrivateRoute allowedRoles={['Customer']}><Payments /></PrivateRoute>} />
      
      {/* Technician Routes */}
      <Route path="/technician" element={<PrivateRoute allowedRoles={['Technician']}><TechnicianDashboard /></PrivateRoute>} />
      <Route path="/technician/tasks" element={<PrivateRoute allowedRoles={['Technician']}><TechnicianTasks /></PrivateRoute>} />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
