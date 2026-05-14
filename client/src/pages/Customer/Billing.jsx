import React, { useState, useEffect } from 'react';
import Card from '../../components/Card/Card';
import Table from '../../components/Table/Table';
import { CreditCard, Download, ShieldCheck, FileText, CheckCircle } from 'lucide-react';
import { formatINR } from '../../utils/formatCurrency';
import api from '../../services/api';

const CustomerBilling = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAutoPayEnabled, setIsAutoPayEnabled] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const { data } = await api.get('/customer/payments');
        setInvoices(
          data.map((bill) => ({
            id: bill._id.substring(bill._id.length - 6).toUpperCase(),
            date: new Date(bill.billingDate || bill.createdAt).toLocaleDateString('en-IN'),
            amount: Number(bill.amount || 0),
            status: bill.status,
            _id: bill._id
          }))
        );
      } catch (error) {
        console.error('Error fetching bills:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBills();
  }, []);

  const handlePay = (id) => {
    setPaymentLoading(true);
    setTimeout(() => {
      setInvoices(invoices.map(inv => inv.id === id ? { ...inv, status: 'Paid' } : inv));
      setPaymentLoading(false);
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
    { 
      header: 'Actions', 
      accessor: 'actions',
      render: (row) => (
        <div className="flex gap-2">
           <button className="btn btn-outline py-1 px-2 text-sm flex gap-1 items-center" onClick={() => alert('Downloading PDF Invoice...')}>
             <Download size={14} /> PDF
           </button>
           {row.status === 'Pending' && (
             <button className="btn btn-primary py-1 px-2 text-sm flex gap-1 items-center" onClick={() => handlePay(row.id)} disabled={paymentLoading}>
               <CreditCard size={14} /> {paymentLoading ? 'Processing...' : 'Pay'}
             </button>
           )}
        </div>
      )
    }
  ];

  const pendingTotal = invoices.reduce((acc, curr) => (curr.status === 'Pending' ? acc + Number(curr.amount || 0) : acc), 0);

  if (loading) return <div className="p-20 text-center"><h3>Loading billing data...</h3></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2>Billing & Payments</h2>
          <p className="text-muted">Manage your payment methods and invoice history</p>
        </div>
      </div>

      <div className="flex gap-6 mb-8">
        <div style={{ flex: 1.5 }}>
           <div className="glass-card p-6 h-full flex flex-col justify-between">
              <div>
                 <h3 className="mb-4">Current Balance</h3>
                 <p className="text-2-5rem font-bold text-white mb-2">{formatINR(pendingTotal)}</p>
                 {pendingTotal > 0 ? (
                    <p className="text-warning text-sm flex gap-1 items-center"><ShieldCheck size={14} /> Due on 15 April 2026</p>
                 ) : (
                    <p className="text-success text-sm flex gap-1 items-center"><CheckCircle size={14} /> All caught up!</p>
                 )}
              </div>
              {pendingTotal > 0 && (
                <button className="btn btn-primary mt-6 w-full py-3" onClick={() => handlePay(invoices.find(i=>i.status==='Pending').id)} disabled={paymentLoading}>
                   {paymentLoading ? 'Authenticating Secure Payment...' : 'Pay Outstanding Balance'}
                </button>
              )}
           </div>
        </div>

        <div style={{ flex: 1 }}>
           <div className="glass-card p-6 h-full border border-[rgba(59,130,246,0.2)]" style={{ background: isAutoPayEnabled ? 'rgba(59,130,246,0.05)' : '' }}>
              <div className="flex justify-between items-start mb-4">
                 <h3 className="flex items-center gap-2"><CreditCard className="text-primary"/> AutoPay</h3>
                 <div 
                   className={`w-12 h-6 rounded-full cursor-pointer transition-colors relative ${isAutoPayEnabled ? 'bg-primary' : 'bg-gray-600'}`}
                   onClick={() => setIsAutoPayEnabled(!isAutoPayEnabled)}
                 >
                   <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${isAutoPayEnabled ? 'left-7' : 'left-1'}`}></div>
                 </div>
              </div>
              <p className="text-sm text-muted mb-4">
                 Never miss a payment. Automatically pay your monthly invoice through UPI or card on the 1st of every month.
              </p>
              {isAutoPayEnabled && (
                <div className="mt-4 p-3 bg-[rgba(16,185,129,0.1)] text-success text-sm rounded border border-[rgba(16,185,129,0.2)]">
                   AutoPay is active. Connected to customer@upi.
                </div>
              )}
           </div>
        </div>
      </div>

      <h3 className="mb-4">Invoice History</h3>
      <Table columns={columns} data={invoices} />
    </div>
  );
};

export default CustomerBilling;
