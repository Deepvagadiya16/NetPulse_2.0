import React, { useState, useEffect } from 'react';
import Table from '../../components/Table/Table';
import api from '../../services/api';
import { useAlert } from '../../context/AlertContext';
import { formatINR } from '../../utils/formatCurrency';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', planId: '', address: '', phone: '' });
  const [editFormData, setEditFormData] = useState({ planId: '' });
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const { showAlert } = useAlert();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [custRes, planRes] = await Promise.all([
          api.get('/admin/customers'),
          api.get('/plans')
        ]);
        setCustomers(custRes.data);
        setPlans(planRes.data);
        if (planRes.data.length > 0) {
          setFormData(prev => ({ ...prev, planId: planRes.data[0]._id }));
        }
      } catch {
        showAlert("Failed to fetch data", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [showAlert]);

  const columns = [
    { 
      header: 'ID', 
      accessor: '_id',
      render: (row) => row._id?.substring(row._id.length - 6).toUpperCase() || 'N/A'
    },
    { header: 'Name', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    { 
      header: 'Plan', 
      accessor: 'planId',
      render: (row) => row.planId?.name || 'N/A'
    },
    { 
      header: 'Plan Validity', 
      accessor: 'planValidity',
      render: (row) => row.planValidity ? new Date(row.planValidity).toLocaleDateString('en-IN') : 'N/A'
    },
    { 
      header: 'Status', 
      accessor: 'status',
      render: (row) => (
        <span className={`badge ${row.status === 'Active' ? 'badge-success' : row.status === 'Pending' ? 'badge-warning' : 'badge-danger'}`}>
          {row.status}
        </span>
      )
    },
    { 
      header: 'Action', 
      accessor: 'action',
      render: (row) => (
        <div className="flex gap-2">
          <button 
            className="btn btn-outline py-1 px-2 text-sm text-primary"
            onClick={() => handleEdit(row)}
          >
            Edit
          </button>
          <button 
            className="btn btn-outline py-1 px-2 text-sm text-danger"
            onClick={() => handleDelete(row._id)}
          >
            Delete
          </button>
        </div>
      )
    }
  ];

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure? This customer will be deleted but their billing records will be kept.")) return;
    try {
      await api.delete(`/admin/customers/${id}`);
      setCustomers(customers.filter(c => c._id !== id));
      showAlert("Customer deleted successfully", "success");
    } catch {
      showAlert("Failed to delete customer", "error");
    }
  };

  const handleEdit = (customer) => {
    setSelectedCustomer(customer);
    setEditFormData({ planId: customer.planId?._id || '' });
    setIsEditModalOpen(true);
  };

  const handleUpdateCustomer = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/admin/customers/${selectedCustomer._id}`, editFormData);
      const fullRes = await api.get('/admin/customers');
      setCustomers(fullRes.data);
      setIsEditModalOpen(false);
      setSelectedCustomer(null);
      setEditFormData({ planId: '' });
      showAlert("Customer plan updated successfully", "success");
    } catch (error) {
      showAlert(error.response?.data?.message || "Failed to update customer", "error");
    }
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/customers', formData);
      const fullRes = await api.get('/admin/customers');
      setCustomers(fullRes.data);
      setIsModalOpen(false);
      setFormData({ name: '', email: '', password: '', planId: plans[0]?._id || '', address: '', phone: '' });
      showAlert("Customer added successfully", "success");
    } catch (error) {
      showAlert(error.response?.data?.message || "Failed to add customer", "error");
    }
  };

  if (loading) {
    return <div className="p-20 text-center"><h3>Loading customers...</h3></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2>Customer Management</h2>
          <p className="text-muted">View and manage all ISP customers</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>Add Customer</button>
      </div>

      <Table columns={columns} data={customers} />

      {/* Modal Overlay directly using inline absolute/fixed to avoid complex CSS files for now */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-card" style={{ width: '400px', padding: '2rem' }}>
            <h3 className="mb-4">Add New Customer</h3>
            <form onSubmit={handleCreateCustomer}>
              <div className="input-group">
                <label className="input-label">Full Name</label>
                <input 
                  type="text" required className="input-field" 
                  value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} 
                />
              </div>
              <div className="input-group">
                <label className="input-label">Email</label>
                <input 
                  type="email" required className="input-field" 
                  value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} 
                />
              </div>
              <div className="input-group">
                <label className="input-label">Select Plan</label>
                <select 
                  className="input-field" style={{ backgroundColor: 'var(--bg-surface)' }}
                  value={formData.planId} onChange={(e) => setFormData({...formData, planId: e.target.value})}
                  required
                >
                  <option value="">-- Choose Plan --</option>
                  {plans.map(p => (
                    <option key={p._id} value={p._id}>{p.name} ({formatINR(p.price)})</option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Initial Password</label>
                <input 
                  type="password" className="input-field" placeholder="customer123"
                  value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} 
                />
              </div>
              <div className="flex gap-4 mt-8">
                <button type="button" className="btn btn-outline flex-1" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary flex-1">Save Customer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {isEditModalOpen && (
        <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Customer Plan</h3>
              <button className="modal-close" onClick={() => setIsEditModalOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <p className="text-muted mb-4">Update the plan for {selectedCustomer?.name}</p>
              <form onSubmit={handleUpdateCustomer}>
                <div className="input-group">
                  <label className="input-label">Select Plan</label>
                  <select 
                    className="input-field" style={{ backgroundColor: 'var(--bg-surface)' }}
                    value={editFormData.planId} onChange={(e) => setEditFormData({...editFormData, planId: e.target.value})}
                    required
                  >
                    <option value="">-- Choose Plan --</option>
                    {plans.map(p => (
                      <option key={p._id} value={p._id}>{p.name} ({formatINR(p.price)})</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-4 mt-8">
                  <button type="button" className="btn btn-outline flex-1" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary flex-1">Update Plan</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;
