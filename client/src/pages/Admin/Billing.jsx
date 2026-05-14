import React, { useEffect, useState } from 'react';
import Table from '../../components/Table/Table';
import Card from '../../components/Card/Card';
import { CreditCard, DollarSign, AlertTriangle, FileText, Plus, Download, CheckCircle } from 'lucide-react';
import api from '../../services/api';
import { useAlert } from '../../context/AlertContext';
import { formatINR } from '../../utils/formatCurrency';

const formatInvoiceId = (value) => (value ? value.substring(value.length - 6).toUpperCase() : 'N/A');
const isOutstandingStatus = (status) => ['Pending', 'Unpaid', 'Overdue'].includes(status);
const formatDate = (value) => (value ? new Date(value).toLocaleDateString('en-IN') : 'N/A');

const AdminBilling = () => {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [viewInvoice, setViewInvoice] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [activePaymentInvoice, setActivePaymentInvoice] = useState(null);
  const [paymentMode, setPaymentMode] = useState('Online');
  const { showAlert } = useAlert();
  const [formData, setFormData] = useState({ customerId: '', amount: '', dueDate: '', description: '', planId: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [billRes, custRes, planRes] = await Promise.all([
          api.get('/admin/bills'),
          api.get('/admin/customers'),
          api.get('/plans'),
        ]);

        setInvoices(billRes.data);
        setCustomers(custRes.data);
        setPlans(planRes.data);
      } catch {
        showAlert('Failed to fetch billing data', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [showAlert]);

  const handleGenerateBill = async (e) => {
    e.preventDefault();

    try {
      await api.post('/admin/bills', formData);
      const fullRes = await api.get('/admin/bills');
      setInvoices(fullRes.data);
      setIsGenerateModalOpen(false);
      setFormData({ customerId: '', amount: '', dueDate: '', description: '', planId: '' });
      showAlert('Invoice generated successfully', 'success');
    } catch (error) {
      showAlert(error.response?.data?.message || 'Failed to generate invoice', 'error');
    }
  };

  const openPaymentModal = (invoice) => {
    setActivePaymentInvoice(invoice);
    setPaymentMode('Online');
    setPaymentModalOpen(true);
  };

  const handleMarkPaid = async (e) => {
    e.preventDefault();

    try {
      const { data } = await api.patch(`/admin/bills/${activePaymentInvoice._id}`, {
        status: 'Paid',
        paymentMethod: paymentMode,
      });

      setInvoices(invoices.map((invoice) => (invoice._id === data._id ? data : invoice)));
      setPaymentModalOpen(false);
      setActivePaymentInvoice(null);
      showAlert('Payment recorded successfully', 'success');
    } catch (error) {
      showAlert(error.response?.data?.message || 'Failed to record payment', 'error');
    }
  };

  const handleDownload = () => {
    showAlert(`Downloading PDF for ${formatInvoiceId(viewInvoice?._id)}...`, 'info');
  };

  const columns = [
    {
      header: 'Inv ID',
      accessor: '_id',
      render: (row) => formatInvoiceId(row._id),
    },
    {
      header: 'Customer',
      accessor: 'customer',
      render: (row) => row.customer?.name || 'Unknown',
    },
    {
      header: 'Amount',
      accessor: 'amount',
      render: (row) => formatINR(row.amount),
    },
    {
      header: 'Date',
      accessor: 'createdAt',
      render: (row) => formatDate(row.billingDate || row.createdAt),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => {
        let badgeClass = 'badge-primary';
        if (row.status === 'Paid') badgeClass = 'badge-success';
        if (row.status === 'Unpaid') badgeClass = 'badge-warning';
        if (row.status === 'Overdue') badgeClass = 'badge-danger';
        return <span className={`badge ${badgeClass}`}>{row.status}</span>;
      },
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <div className="flex gap-2">
          <button className="btn btn-outline py-1 px-2 text-sm flex items-center gap-1" onClick={() => setViewInvoice(row)}>
            <FileText size={14} /> View
          </button>
          {isOutstandingStatus(row.status) && (
            <button className="btn btn-primary py-1 px-2 text-sm flex items-center gap-1" onClick={() => openPaymentModal(row)}>
              <CheckCircle size={14} /> Pay
            </button>
          )}
        </div>
      ),
    },
  ];

  const totalRev = invoices.reduce(
    (acc, invoice) => (invoice.status === 'Paid' ? acc + Number(invoice.amount || 0) : acc),
    0
  );

  if (loading) {
    return <div className="p-20 text-center"><h3>Loading billing records...</h3></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2>Billing Management</h2>
          <p className="text-muted">Oversee customer invoices, collections, and revenue in INR</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsGenerateModalOpen(true)}>
          <Plus size={18} /> Generate New Invoice
        </button>
      </div>

      <div className="grid-summary flex gap-6 mb-8">
        <div style={{ flex: 1 }}>
          <Card title="Collected Revenue" value={formatINR(totalRev)} icon={DollarSign} trend={4.5} />
        </div>
        <div style={{ flex: 1 }}>
          <Card title="Paid Invoices" value={invoices.filter((invoice) => invoice.status === 'Paid').length.toString()} icon={CreditCard} />
        </div>
        <div style={{ flex: 1 }}>
          <Card title="Overdue Invoices" value={invoices.filter((invoice) => invoice.status === 'Overdue').length.toString()} icon={AlertTriangle} trend={-2.1} />
        </div>
      </div>

      <Table columns={columns} data={invoices} emptyMessage="No billing records found." />

      {isGenerateModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-card animate-fade-in" style={{ width: '450px', padding: '2rem' }}>
            <h3 className="mb-4 text-primary">Generate Custom Invoice</h3>

            <form onSubmit={handleGenerateBill}>
              <div className="input-group">
                <label className="input-label">Select Customer</label>
                <select className="input-field" style={{ backgroundColor: 'var(--bg-surface)' }} value={formData.customerId} onChange={(e) => setFormData({ ...formData, customerId: e.target.value })} required>
                  <option value="">-- Choose Customer --</option>
                  {customers.map((customer) => (
                    <option key={customer._id} value={customer._id}>{customer.name} ({customer.email})</option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Assign Plan (Optional)</label>
                <select className="input-field" style={{ backgroundColor: 'var(--bg-surface)' }} value={formData.planId} onChange={(e) => setFormData({ ...formData, planId: e.target.value })}>
                  <option value="">-- No Plan Assignment --</option>
                  {plans.map((plan) => (
                    <option key={plan._id} value={plan._id}>{plan.name} ({formatINR(plan.price)})</option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Due Date</label>
                <input type="date" required className="input-field" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} />
              </div>
              <div className="input-group">
                <label className="input-label">Select Plan / Item</label>
                <select
                  className="input-field"
                  style={{ backgroundColor: 'var(--bg-surface)' }}
                  value={formData.description}
                  required
                  onChange={(e) => {
                    const selectedPlan = plans.find((plan) => plan.name === e.target.value);
                    setFormData({
                      ...formData,
                      description: e.target.value,
                      amount: selectedPlan ? selectedPlan.price : formData.amount,
                    });
                  }}
                >
                  <option value="">-- Select Plan --</option>
                  {plans.map((plan) => (
                    <option key={plan._id} value={plan.name}>{plan.name} ({formatINR(plan.price)})</option>
                  ))}
                  <option value="Installation Fee">Installation Fee</option>
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Amount (INR)</label>
                <input type="number" step="0.01" required className="input-field" placeholder="ex. 699" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} />
              </div>
              <div className="flex justify-between mt-8 gap-4">
                <button type="button" className="btn btn-outline flex-1" onClick={() => setIsGenerateModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary flex-1">Issue Invoice</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {paymentModalOpen && activePaymentInvoice && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-card animate-fade-in" style={{ width: '400px', padding: '2rem' }}>
            <h3 className="mb-4">Record Payment</h3>
            <p className="text-muted mb-4">Marking invoice <strong>{formatInvoiceId(activePaymentInvoice._id)}</strong> as Paid.</p>

            <form onSubmit={handleMarkPaid}>
              <div className="input-group">
                <label className="input-label">Amount Receivable</label>
                <input type="text" className="input-field" value={formatINR(activePaymentInvoice.amount)} disabled />
              </div>
              <div className="input-group">
                <label className="input-label">Payment Mode</label>
                <select className="input-field" style={{ backgroundColor: 'var(--bg-surface)' }} value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}>
                  <option value="Online">Online / UPI</option>
                  <option value="Cash">Cash Collection</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>
              <div className="flex justify-between mt-8 gap-4">
                <button type="button" className="btn btn-outline flex-1" onClick={() => setPaymentModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary flex-1">Confirm Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewInvoice && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-card animate-fade-in" style={{ width: '500px', padding: '2.5rem', backgroundColor: '#ffffff', color: '#1a1a1a' }}>
            <div className="flex justify-between items-start border-b pb-4 mb-4" style={{ borderColor: '#e5e7eb' }}>
              <div>
                <h2 style={{ color: '#000' }}>INVOICE</h2>
                <p style={{ color: '#4b5563', fontSize: '0.85rem' }}>{formatInvoiceId(viewInvoice._id)}</p>
              </div>
              <div className="text-right">
                <h3 style={{ color: '#3b82f6', margin: 0 }}>NetPulse India</h3>
                <p style={{ color: '#4b5563', fontSize: '0.85rem' }}>Prahlad Nagar, Ahmedabad</p>
              </div>
            </div>

            <div className="mb-6">
              <p style={{ color: '#4b5563', fontSize: '0.9rem', marginBottom: '0.2rem' }}>Billed To:</p>
              <h4 style={{ color: '#000', margin: 0 }}>{viewInvoice.customer?.name || 'Unknown Customer'}</h4>
              <p style={{ color: '#4b5563', fontSize: '0.85rem' }}>Date Issued: {formatDate(viewInvoice.billingDate || viewInvoice.createdAt)}</p>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
                  <th style={{ padding: '0.5rem 0', color: '#000' }}>Description</th>
                  <th style={{ padding: '0.5rem 0', textAlign: 'right', color: '#000' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '1rem 0', color: '#1f2937' }}>{viewInvoice.description}</td>
                  <td style={{ padding: '1rem 0', textAlign: 'right', color: '#1f2937' }}>{formatINR(viewInvoice.amount)}</td>
                </tr>
              </tbody>
            </table>

            <div className="flex justify-between items-center mb-8">
              <div>
                {viewInvoice.status === 'Paid' ? (
                  <span style={{ color: '#10b981', fontWeight: 'bold' }}>PAID via {viewInvoice.paymentMethod || 'Recorded payment'}</span>
                ) : (
                  <span style={{ color: '#ef4444', fontWeight: 'bold' }}>{viewInvoice.status}</span>
                )}
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ color: '#4b5563', fontSize: '0.9rem', display: 'inline', marginRight: '1rem' }}>Total Due:</p>
                <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#000' }}>
                  {viewInvoice.status === 'Paid' ? formatINR(0) : formatINR(viewInvoice.amount)}
                </span>
              </div>
            </div>

            <div className="flex justify-between gap-4">
              <button className="btn btn-outline flex-1" style={{ borderColor: '#d1d5db', color: '#374151' }} onClick={() => setViewInvoice(null)}>Close</button>
              <button className="btn btn-primary flex-1 flex items-center justify-center gap-2" onClick={handleDownload}>
                <Download size={16} /> Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBilling;
