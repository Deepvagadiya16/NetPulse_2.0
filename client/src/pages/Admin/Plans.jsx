import React, { useState, useEffect } from 'react';
import Table from '../../components/Table/Table';
import Card from '../../components/Card/Card';
import { Wifi, Plus, Trash2, Edit } from 'lucide-react';
import api from '../../services/api';
import { useAlert } from '../../context/AlertContext';
import { formatINR } from '../../utils/formatCurrency';

const AdminPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  
  const defaultForm = { provider: '', name: '', speed: '', price: '', isActive: true };
  const [formData, setFormData] = useState(defaultForm);
  const { showAlert } = useAlert();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data } = await api.get('/plans');
        setPlans(data);
      } catch {
        showAlert("Failed to fetch plans", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, [showAlert]);

  const openModal = (plan = null) => {
    if (plan) {
      setEditingPlan(plan._id);
      setFormData({
        provider: plan.provider || '',
        name: plan.name,
        speed: plan.speed,
        price: plan.price,
        isActive: plan.isActive
      });
    } else {
      setEditingPlan(null);
      setFormData(defaultForm);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPlan(null);
    setFormData(defaultForm);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingPlan) {
        const { data } = await api.patch(`/plans/${editingPlan}`, formData);
        setPlans(plans.map(p => p._id === editingPlan ? data : p));
        showAlert("Plan updated successfully", "success");
      } else {
        const { data } = await api.post('/plans', formData);
        setPlans([...plans, data]);
        showAlert("Plan added successfully", "success");
      }
      closeModal();
    } catch {
      showAlert("Failed to save plan", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this plan?")) return;
    try {
      await api.delete(`/plans/${id}`);
      setPlans(plans.filter(p => p._id !== id));
      showAlert("Plan deleted successfully", "success");
    } catch {
      showAlert("Failed to delete plan", "error");
    }
  };

  const columns = [
    { header: 'Provider', accessor: 'provider' },
    { header: 'Package Name', accessor: 'name' },
    { header: 'Speed', accessor: 'speed' },
    { 
      header: 'Price / mo', 
      accessor: 'price',
      render: (row) => formatINR(row.price)
    },
    { 
      header: 'Status', 
      accessor: 'isActive',
      render: (row) => (
        <span className={`badge ${row.isActive ? 'badge-success' : 'badge-danger'}`}>
          {row.isActive ? 'Active' : 'Inactive'}
        </span>
      )
    },
    { 
      header: 'Actions', 
      accessor: 'actions',
      render: (row) => (
        <div className="flex gap-4">
          <button className="text-primary hover:text-primary-hover transition-fast" onClick={() => openModal(row)}>
            <Edit size={18} />
          </button>
          <button className="text-danger hover:text-red-400 transition-fast" onClick={() => handleDelete(row._id)}>
            <Trash2 size={18} />
          </button>
        </div>
      )
    }
  ];

  const activePlans = plans.filter((plan) => plan.isActive);
  const averageRevenuePerUser = activePlans.length
    ? activePlans.reduce((total, plan) => total + Number(plan.price || 0), 0) / activePlans.length
    : 0;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2>Internet Plans</h2>
          <p className="text-muted">Manage Indian broadband packages, providers, and pricing in INR</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={18} /> Add New Plan
        </button>
      </div>

      <div className="grid-summary flex gap-6 mb-8">
        <div style={{ flex: 1 }}>
          <Card title="Active Packages" value={activePlans.length.toString()} icon={Wifi} />
        </div>
        <div style={{ flex: 1 }}>
          <Card title="Avg Rev / User" value={formatINR(averageRevenuePerUser)} />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading plans...</div>
      ) : (
        <Table columns={columns} data={plans} emptyMessage="No internet plans configured." />
      )}

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-card animate-fade-in" style={{ width: '450px', padding: '2rem' }}>
            <h3 className="mb-4">{editingPlan ? 'Edit Plan' : 'Create New Plan'}</h3>
            <form onSubmit={handleSave}>
              <div className="input-group">
                <label className="input-label">Provider</label>
                <input 
                  type="text" required className="input-field" placeholder="ex. JioFiber"
                  value={formData.provider} onChange={(e) => setFormData({...formData, provider: e.target.value})} 
                />
              </div>
              <div className="input-group">
                <label className="input-label">Plan Name</label>
                <input 
                  type="text" required className="input-field" placeholder="ex. JioFiber 100"
                  value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} 
                />
              </div>
              <div className="flex gap-4">
                <div className="input-group" style={{ flex: 1 }}>
                  <label className="input-label">Speed</label>
                  <input 
                    type="text" required className="input-field" placeholder="ex. 100 Mbps"
                    value={formData.speed} onChange={(e) => setFormData({...formData, speed: e.target.value})} 
                  />
                </div>
                <div className="input-group" style={{ flex: 1 }}>
                  <label className="input-label">Price (INR)</label>
                  <input 
                    type="number" step="0.01" required className="input-field" placeholder="ex. 699"
                    value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} 
                  />
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Status</label>
                <select 
                  className="input-field" style={{ backgroundColor: 'var(--bg-surface)' }}
                  value={formData.isActive} onChange={(e) => setFormData({...formData, isActive: e.target.value === 'true'})}
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
              <div className="flex justify-between mt-8 gap-4">
                <button type="button" className="btn btn-outline flex-1" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary flex-1">Save Plan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPlans;
