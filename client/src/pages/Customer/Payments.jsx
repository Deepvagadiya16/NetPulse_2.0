import React, { useEffect, useState } from 'react';
import { CreditCard, Download, Plus, AlertCircle, CheckCircle2, History, DollarSign } from 'lucide-react';
import Card from '../../components/Card/Card';
import Table from '../../components/Table/Table';
import api from '../../services/api';
import { useAlert } from '../../context/AlertContext';
import { formatINR } from '../../utils/formatCurrency';

const isOutstandingStatus = (status) => ['Pending', 'Unpaid', 'Overdue'].includes(status);

const Payments = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing] = useState(false);
  const { showAlert } = useAlert();

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const { data } = await api.get('/customer/payments');
        setInvoices(
          data.map((bill) => ({
            ...bill,
            id: bill._id.substring(bill._id.length - 8).toUpperCase(),
            billingLabel: new Date(bill.billingDate || bill.createdAt).toLocaleDateString('en-IN'),
            dueDateLabel: bill.dueDate ? new Date(bill.dueDate).toLocaleDateString('en-IN') : 'N/A',
            amountValue: Number(bill.amount || 0),
          }))
        );
      } catch (error) {
        console.error('Error fetching payments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const handlePayNow = async (id) => {
    showAlert(`Processing payment for invoice ${id}`, 'info');
  };

  const columns = [
    { header: 'Invoice ID', accessor: 'id' },
    { header: 'Billing Date', accessor: 'billingLabel' },
    { header: 'Due Date', accessor: 'dueDateLabel' },
    {
      header: 'Amount',
      accessor: 'amountValue',
      render: (row) => formatINR(row.amountValue),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <span className={`badge ${row.status === 'Paid' ? 'badge-success' : row.status === 'Overdue' ? 'badge-danger' : 'badge-warning'}`}>
          {row.status}
        </span>
      ),
    },
    {
      header: 'Action',
      accessor: 'action',
      render: (row) => (
        <div className="flex gap-2">
          {isOutstandingStatus(row.status) && (
            <button
              className="btn btn-primary py-1 px-3 text-sm"
              onClick={() => handlePayNow(row.id)}
              disabled={isProcessing}
            >
              {isProcessing ? '...' : 'Pay Now'}
            </button>
          )}
          <button className="btn btn-outline py-1 px-2 text-sm" title="Download PDF">
            <Download size={14} />
          </button>
        </div>
      ),
    },
  ];

  const pendingInvoices = invoices.filter((invoice) => isOutstandingStatus(invoice.status));
  const totalPending = pendingInvoices.reduce((sum, invoice) => sum + invoice.amountValue, 0);

  if (loading) return <div className="p-20 text-center"><h3>Accessing Billing Vault...</h3></div>;

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2>Billing & Payments</h2>
          <p className="text-muted">Manage your invoices, payment methods, and billing history in INR.</p>
        </div>
        <button className="btn btn-outline flex items-center gap-2">
          <History size={18} /> View All History
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <Card title="Balance Due" value={formatINR(totalPending)} icon={DollarSign}>
          {totalPending > 0 ? (
            <div className="mt-2 text-sm flex items-center gap-2 text-warning">
              <AlertCircle size={14} /> Due by {pendingInvoices[0]?.dueDateLabel}
            </div>
          ) : (
            <div className="mt-2 text-sm flex items-center gap-2 text-success">
              <CheckCircle2 size={14} /> Your account is up to date
            </div>
          )}
        </Card>

        <Card title="Last Payment" value={pendingInvoices.length === invoices.length ? formatINR(0) : formatINR(invoices.find((invoice) => invoice.status === 'Paid')?.amountValue || 0)} icon={CheckCircle2}>
          <div className="mt-2 text-sm text-muted">
            {invoices.find((invoice) => invoice.status === 'Paid')?.billingLabel ? `Paid on ${invoices.find((invoice) => invoice.status === 'Paid')?.billingLabel}` : 'No completed payment yet'}
          </div>
        </Card>
      </div>

      <div className="flex gap-6 mb-8">
        <div style={{ flex: 1 }}>
          <h3 className="mb-4">Recent Transactions</h3>
          <Table columns={columns} data={invoices} />
        </div>
      </div>
    </div>
  );
};

export default Payments;
