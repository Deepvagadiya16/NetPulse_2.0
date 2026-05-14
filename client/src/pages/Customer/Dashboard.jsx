import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wifi, CreditCard, Activity, CheckCircle, Calendar, Zap, Shield, Globe, Phone, ArrowRight } from 'lucide-react';
import Card from '../../components/Card/Card';
import Table from '../../components/Table/Table';
import api from '../../services/api';
import { formatINR } from '../../utils/formatCurrency';

const initialInvoices = [
  { id: 'INV-202604', date: '2026-04-01', amount: 699, status: 'Pending' },
  { id: 'INV-202603', date: '2026-03-01', amount: 699, status: 'Paid' },
  { id: 'INV-202602', date: '2026-02-01', amount: 699, status: 'Paid' },
];

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const [currentPlan, setCurrentPlan] = useState(null);
  const [invoices, setInvoices] = useState(initialInvoices);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [speedTestResult, setSpeedTestResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlanData = async () => {
      try {
        const response = await api.get('/customer/my-plan');
        setCurrentPlan(response.data);
      } catch (error) {
        console.error('Error fetching plan:', error);
        // Set default plan if API fails
        setCurrentPlan({
          name: 'JioFiber 100',
          speed: '100 Mbps',
          dataLimit: 'Unlimited',
          price: 699,
          status: 'Active',
          validity: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
          provider: 'Indian Broadband'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchPlanData();
  }, []);

  const handlePay = () => {
    setLoadingPayment(true);
    setTimeout(() => {
      setInvoices(invoices.map(inv => 
        inv.status === 'Pending' ? { ...inv, status: 'Paid' } : inv
      ));
      setLoadingPayment(false);
    }, 1000);
  };

  const runSpeedTest = () => {
    setSpeedTestResult('Testing...');
    setTimeout(() => {
      setSpeedTestResult('96 Mbps / 93 Mbps');
    }, 1500);
  };

  const columns = [
    { header: 'Invoice ID', accessor: 'id' },
    { header: 'Date', accessor: 'date' },
    {
      header: 'Amount',
      accessor: 'amount',
      render: (row) => formatINR(row.amount),
    },
    { 
      header: 'Status', 
      accessor: 'status',
      render: (row) => (
        <span className={`badge ${row.status === 'Paid' ? 'badge-success' : 'badge-warning'}`}>
          {row.status}
        </span>
      )
    },
  ];

  const pendingAmountValue = invoices
    .filter((invoice) => invoice.status === 'Pending')
    .reduce((total, invoice) => total + Number(invoice.amount || 0), 0);
  const pendingAmount = formatINR(pendingAmountValue);

  const getRenewalDays = () => {
    if (!currentPlan?.validity) return null;
    const daysRemaining = Math.ceil((new Date(currentPlan.validity) - new Date()) / (1000 * 60 * 60 * 24));
    return daysRemaining > 0 ? daysRemaining : 0;
  };

  const renewalDays = getRenewalDays();

  if (loading) return <div className="p-20 text-center"><h3>Loading your dashboard...</h3></div>;

  return (
    <div className="animate-fade-in">
      {/* Header Section */}
      <div className="mb-8">
        <h2>My Dashboard</h2>
        <p className="text-muted">Welcome back! Here's an overview of your internet plan and billing.</p>
      </div>

      {/* Primary Info Card - Plan Overview */}
      <div className="glass-card p-8 mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Wifi className="text-primary" size={24} />
              <h1 className="text-3xl font-bold text-primary">{currentPlan?.name || 'JioFiber 100'}</h1>
            </div>
            <p className="text-muted text-lg">{currentPlan?.provider || 'Indian Broadband'} • {currentPlan?.speed || '100 Mbps'} Download & Upload</p>
          </div>
          <div className="text-right">
            <span className="badge badge-success mb-2 block">Active & Connected</span>
            <div className="text-3xl font-bold text-primary">{formatINR(currentPlan?.price || 699)}</div>
            <p className="text-sm text-muted">/month</p>
          </div>
        </div>

        {/* Plan Status Grid */}
        <div className="grid grid-cols-4 gap-4 pt-6 border-t border-[rgba(255,255,255,0.1)]">
          <div className="bg-[rgba(255,255,255,0.03)] p-4 rounded-lg">
            <p className="text-muted text-xs uppercase tracking-wider mb-2">Data Limit</p>
            <p className="text-xl font-semibold text-primary">{currentPlan?.dataLimit || 'Unlimited'}</p>
          </div>
          <div className="bg-[rgba(255,255,255,0.03)] p-4 rounded-lg">
            <p className="text-muted text-xs uppercase tracking-wider mb-2">Max Speed</p>
            <p className="text-xl font-semibold text-primary">{currentPlan?.speed || '100 Mbps'}</p>
          </div>
          <div className="bg-[rgba(255,255,255,0.03)] p-4 rounded-lg">
            <p className="text-muted text-xs uppercase tracking-wider mb-2">Valid Until</p>
            <p className="text-lg font-semibold">
              {renewalDays ? (
                <span>{renewalDays} <span className="text-xs text-muted">days</span></span>
              ) : (
                'N/A'
              )}
            </p>
          </div>
          <div className="bg-[rgba(255,255,255,0.03)] p-4 rounded-lg">
            <p className="text-muted text-xs uppercase tracking-wider mb-2">Renewal Date</p>
            <p className="text-sm font-semibold">
              {currentPlan?.validity 
                ? new Date(currentPlan.validity).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
                : 'N/A'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats & Actions */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        {/* Billing Card */}
        <div 
          className="glass-card p-6 cursor-pointer hover:bg-[rgba(255,255,255,0.05)] transition transform hover:scale-105"
          onClick={() => navigate('/customer/payments')}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-muted text-sm uppercase tracking-wider mb-1">Current Bill</p>
              <h3 className="text-2xl font-bold text-primary">{pendingAmount}</h3>
            </div>
            <CreditCard className="text-primary" size={24} />
          </div>
          {pendingAmountValue > 0 ? (
            <>
              <p className="text-xs text-warning mb-4">Due on 15 April 2026</p>
              <button 
                className="btn btn-primary w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePay();
                }}
                disabled={loadingPayment}
              >
                {loadingPayment ? 'Processing...' : 'Pay Now'}
              </button>
              <p className="text-xs text-muted mt-2 text-center">Click card to view all payments</p>
            </>
          ) : (
            <>
              <p className="text-xs text-success font-semibold">✓ All set! No pending bills</p>
              <p className="text-xs text-muted mt-2 text-center">Click to view payment history</p>
            </>
          )}
        </div>

        {/* Data Usage Card */}
        <div 
          className="glass-card p-6 cursor-pointer hover:bg-[rgba(255,255,255,0.05)] transition transform hover:scale-105"
          onClick={() => navigate('/customer/my-plan')}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-muted text-sm uppercase tracking-wider mb-1">Data Used</p>
              <h3 className="text-2xl font-bold text-primary">452 GB</h3>
            </div>
            <Activity className="text-primary" size={24} />
          </div>
          <div className="mb-3">
            <div className="w-full bg-[rgba(255,255,255,0.1)] rounded-full h-2">
              <div className="bg-gradient-to-r from-primary to-blue-400 h-2 rounded-full" style={{ width: '45%' }}></div>
            </div>
            <p className="text-xs text-muted mt-2">45% of unlimited plan used</p>
          </div>
          <p className="text-xs text-muted text-center mt-2">Click to manage plan & recharge</p>
        </div>

        {/* Speed Test Card */}
        <div className="glass-card p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-muted text-sm uppercase tracking-wider mb-1">Connection</p>
              <h3 className="text-2xl font-bold text-primary">Optimal</h3>
            </div>
            <Zap className="text-primary" size={24} />
          </div>
          <p className="text-xs text-success mb-4">✓ Running smoothly</p>
          <button 
            className="btn btn-outline w-full text-sm"
            onClick={runSpeedTest}
            disabled={speedTestResult === 'Testing...'}
          >
            {speedTestResult === 'Testing...' ? 'Testing...' : 'Check Speed'}
          </button>
          {speedTestResult && speedTestResult !== 'Testing...' && (
            <p className="text-xs text-success font-semibold mt-2 flex items-center gap-1">
              <CheckCircle size={14} /> {speedTestResult}
            </p>
          )}
        </div>
      </div>

      {/* Plan Features */}
      <div className="glass-card p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">Plan Highlights</h3>
        <div className="grid grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <Shield className="text-primary" size={20} />
            <div>
              <p className="text-sm font-semibold">24/7 Support</p>
              <p className="text-xs text-muted">Always ready to help</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Globe className="text-primary" size={20} />
            <div>
              <p className="text-sm font-semibold">No Data Cap</p>
              <p className="text-xs text-muted">{currentPlan?.dataLimit || 'Unlimited'} usage</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Wifi className="text-primary" size={20} />
            <div>
              <p className="text-sm font-semibold">High Speed</p>
              <p className="text-xs text-muted">Up to {currentPlan?.speed || '100 Mbps'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="text-primary" size={20} />
            <div>
              <p className="text-sm font-semibold">Priority Help</p>
              <p className="text-xs text-muted">Quick resolution</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Invoices Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3>Recent Invoices</h3>
          <a href="#" className="text-primary text-sm hover:underline flex items-center gap-1">
            View All <ArrowRight size={14} />
          </a>
        </div>
        <Table columns={columns} data={invoices} />
      </div>
    </div>
  );
};

export default CustomerDashboard;
