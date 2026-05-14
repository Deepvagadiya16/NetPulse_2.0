import React, { useEffect, useState } from 'react';
import Table from '../../components/Table/Table';
import Card from '../../components/Card/Card';
import { Wrench, Users, Plus, Shield, MapPin } from 'lucide-react';
import api from '../../services/api';
import { useAlert } from '../../context/AlertContext';

const AdminEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '', role: 'Technician', department: 'Field Service', location: 'HQ' });
  const { showAlert } = useAlert();

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const { data } = await api.get('/admin/technicians');
        setEmployees(data);
      } catch (error) {
        showAlert('Failed to fetch employees', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [showAlert]);

  const handleAddEmployee = async (e) => {
    e.preventDefault();

    try {
      const { data } = await api.post('/admin/technicians', formData);
      setEmployees([...employees, data]);
      setIsModalOpen(false);
      setFormData({ name: '', email: '', password: '', phone: '', role: 'Technician', department: 'Field Service', location: 'HQ' });
      showAlert('Technician added successfully', 'success');
    } catch (error) {
      showAlert(error.response?.data?.message || 'Failed to add technician', 'error');
    }
  };

  const handleDeleteEmployee = async (id) => {
    if (!window.confirm('Remove this technician?')) return;

    try {
      await api.delete(`/admin/technicians/${id}`);
      setEmployees(employees.filter((employee) => employee._id !== id));
      showAlert('Technician removed', 'success');
    } catch (error) {
      showAlert('Failed to remove technician', 'error');
    }
  };

  const columns = [
    {
      header: 'EMP ID',
      accessor: '_id',
      render: (row) => row._id?.substring(row._id.length - 6).toUpperCase() || 'N/A',
    },
    { header: 'Name', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    { header: 'Role', accessor: 'role' },
    { header: 'Department', accessor: 'department' },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <span className={`badge ${row.status === 'Active' ? 'badge-success' : 'badge-warning'}`}>
          {row.status}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <div className="flex gap-2">
          <button className="btn btn-outline py-1 px-3 text-sm text-danger" onClick={() => handleDeleteEmployee(row._id)}>
            Delete
          </button>
          {row.role === 'Technician' && (
            <button className="btn btn-primary py-1 px-3 text-sm flex gap-1 items-center" onClick={() => showAlert(`Assigning task for ${row.name}`, 'info')}>
              <Wrench size={14} /> Assign Task
            </button>
          )}
        </div>
      ),
    },
  ];

  if (loading) {
    return <div className="p-20 text-center"><h3>Loading employees...</h3></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2>Employee Directory</h2>
          <p className="text-muted">Manage your ISP staff and assign roles</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> Add Employee
        </button>
      </div>

      <div className="grid-summary flex gap-6 mb-8">
        <div style={{ flex: 1 }}>
          <Card title="Total Staff" value={employees.length.toString()} icon={Users} />
        </div>
        <div style={{ flex: 1 }}>
          <Card title="Field Technicians" value={employees.filter((employee) => employee.role === 'Technician').length.toString()} icon={Wrench} trend={4.1} />
        </div>
        <div style={{ flex: 1 }}>
          <Card title="Admins / Staff" value={employees.filter((employee) => employee.role === 'Admin').length.toString()} icon={Shield} />
        </div>
      </div>

      <Table columns={columns} data={employees} emptyMessage="No employees found." />

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-card animate-fade-in" style={{ width: '500px', padding: '2rem' }}>
            <h3 className="mb-4">Onboard New Employee</h3>
            <form onSubmit={handleAddEmployee}>
              <div className="flex gap-4 mb-4">
                <div className="input-group flex-1" style={{ marginBottom: 0 }}>
                  <label className="input-label">Full Name</label>
                  <input type="text" required className="input-field" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div className="input-group flex-1" style={{ marginBottom: 0 }}>
                  <label className="input-label">Email Address</label>
                  <input type="email" required className="input-field" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                </div>
              </div>

              <div className="flex gap-4 mb-4">
                <div className="input-group flex-1" style={{ marginBottom: 0 }}>
                  <label className="input-label">Role</label>
                  <select className="input-field" style={{ backgroundColor: 'var(--bg-surface)' }} value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                    <option value="Technician">Technician</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div className="input-group flex-1" style={{ marginBottom: 0 }}>
                  <label className="input-label">Department</label>
                  <input type="text" required className="input-field" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} />
                </div>
              </div>

              <div className="input-group mb-4">
                <label className="input-label">Assigned Location</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted" />
                  <input type="text" required className="input-field" style={{ paddingLeft: '2.5rem' }} value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button type="button" className="btn btn-outline flex-1" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary flex-1">Save Profile</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEmployees;
