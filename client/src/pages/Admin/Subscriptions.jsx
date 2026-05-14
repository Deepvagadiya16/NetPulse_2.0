import React, { useEffect, useState } from 'react';
import Table from '../../components/Table/Table';
import Card from '../../components/Card/Card';
import { CheckCircle, XCircle, Clock, User, Package } from 'lucide-react';
import api from '../../services/api';
import { useAlert } from '../../context/AlertContext';
import { formatINR } from '../../utils/formatCurrency';

const AdminSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showAlert } = useAlert();

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const { data } = await api.get('/admin/subscriptions/pending');
        setSubscriptions(data);
      } catch (error) {
        console.error('Error fetching subscriptions:', error);
        showAlert('Failed to fetch subscriptions', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, [showAlert]);

  const handleApprove = async (id) => {
    try {
      await api.patch(`/admin/subscriptions/${id}/approve`);
      setSubscriptions(subscriptions.filter(sub => sub._id !== id));
      showAlert('Subscription approved successfully', 'success');
    } catch (error) {
      console.error('Error approving subscription:', error);
      showAlert('Failed to approve subscription', 'error');
    }
  };

  const columns = [
    {
      header: 'Customer',
      accessor: 'user',
      render: (row) => (
        <div>
          <div className="font-medium">{row.user?.name}</div>
          <div className="text-sm text-muted">{row.user?.email}</div>
        </div>
      )
    },
    {
      header: 'Plan',
      accessor: 'plan',
      render: (row) => (
        <div>
          <div className="font-medium">{row.plan?.name}</div>
          <div className="text-sm text-muted">{row.plan?.speed}</div>
        </div>
      )
    },
    {
      header: 'Amount',
      accessor: 'amount',
      render: (row) => formatINR(row.amount)
    },
    {
      header: 'Request Date',
      accessor: 'requestDate',
      render: (row) => new Date(row.requestDate).toLocaleDateString('en-IN')
    },
    {
      header: 'Status',
      accessor: 'status',
      render: () => (
        <span className="badge badge-warning">
          <Clock size={12} className="mr-1" />
          Pending Approval
        </span>
      )
    },
    {
      header: 'Action',
      accessor: 'action',
      render: (row) => (
        <button
          className="btn btn-success btn-sm"
          onClick={() => handleApprove(row._id)}
        >
          <CheckCircle size={14} className="mr-1" />
          Approve
        </button>
      )
    }
  ];

  if (loading) {
    return <div className="p-20 text-center"><h3>Loading subscriptions...</h3></div>;
  }

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2>Subscription Requests</h2>
          <p className="text-muted">Review and approve customer plan recharge requests</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-warning bg-opacity-10 rounded-lg">
              <Clock className="text-warning" size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold">{subscriptions.length}</h3>
              <p className="text-muted">Pending Approvals</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary bg-opacity-10 rounded-lg">
              <User className="text-primary" size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold">{new Set(subscriptions.map(s => s.user?._id)).size}</h3>
              <p className="text-muted">Unique Customers</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-success bg-opacity-10 rounded-lg">
              <Package className="text-success" size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold">{subscriptions.reduce((sum, s) => sum + s.amount, 0)}</h3>
              <p className="text-muted">Total Revenue Pending</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <Table
          columns={columns}
          data={subscriptions}
          emptyMessage="No pending subscription requests"
        />
      </Card>
    </div>
  );
};

export default AdminSubscriptions;