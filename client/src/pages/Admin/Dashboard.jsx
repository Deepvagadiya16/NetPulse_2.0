import React, { useState, useEffect } from 'react';
import { Users, Wifi, CreditCard, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Card from '../../components/Card/Card';
import Table from '../../components/Table/Table';
import api from '../../services/api';
import { formatINR, formatINRCompact } from '../../utils/formatCurrency';

const mockChartData = [
  { name: 'Jan', revenue: 145000, users: 2400 },
  { name: 'Feb', revenue: 172000, users: 2600 },
  { name: 'Mar', revenue: 168000, users: 2700 },
  { name: 'Apr', revenue: 194000, users: 2900 },
  { name: 'May', revenue: 221000, users: 3100 },
  { name: 'Jun', revenue: 248000, users: 3400 },
];

const columns = [
  { header: 'ID', accessor: 'id' },
  { header: 'Name', accessor: 'name' },
  { header: 'Assigned Plan', accessor: 'plan' },
  { header: 'Signed Up', accessor: 'date' },
  { 
    header: 'Status', 
    accessor: 'status',
    render: (row) => (
      <span className={`badge ${row.status === 'Active' ? 'badge-success' : 'badge-warning'}`}>
        {row.status}
      </span>
    )
  },
];

const AdminDashboard = () => {
  const [stats, setStats] = useState({ customers: 0, technicians: 0, openTickets: 0, revenue: 0 });
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, customersRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/customers')
        ]);
        setStats(statsRes.data);
        setCustomers(customersRes.data.map(c => ({
          id: c._id.substring(c._id.length - 6).toUpperCase(),
          name: c.name,
          plan: c.planId ? c.planId.name : 'No Plan',
          status: c.status || (c.isActive ? 'Active' : 'Inactive'),
          date: new Date(c.createdAt).toLocaleDateString('en-IN')
        })));
      } catch (error) {
        console.error("Error fetching admin data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-20 text-center"><h3>Powering up ISP Metrics...</h3></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2>Admin Dashboard</h2>
          <p className="text-muted">Overview of ISP metrics and network status</p>
        </div>
      </div>

      <div className="grid-summary flex gap-6 mb-8">
        <div style={{ flex: 1 }}>
          <Card title="Total Customers" value={stats.customers.toString()} icon={Users} trend={2.4} />
        </div>
        <div style={{ flex: 1 }}>
          <Card title="Monthly Revenue" value={formatINR(stats.revenue)} icon={CreditCard} trend={10.2} />
        </div>
        <div style={{ flex: 1 }}>
          <Card title="Open Tickets" value={stats.openTickets.toString()} icon={Wifi} />
        </div>
        <div style={{ flex: 1 }}>
          <Card title="Technicians" value={stats.technicians.toString()} icon={Activity} />
        </div>
      </div>

      <div className="flex gap-6 mb-8">
        <div style={{ flex: 2, height: '400px' }} className="glass-card p-6">
          <h3 className="mb-4">Revenue & Growth Trend</h3>
          <ResponsiveContainer width="100%" height="90%">
            <LineChart data={mockChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" tickFormatter={(value) => formatINRCompact(value)} />
              <Tooltip 
                formatter={(value) => formatINR(value)}
                contentStyle={{ backgroundColor: '#151a2a', borderColor: 'rgba(255,255,255,0.1)' }}
                itemStyle={{ color: '#fff' }}
              />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h3 className="mb-4">Recent Customers</h3>
        <Table columns={columns} data={customers} />
      </div>
    </div>
  );
};

export default AdminDashboard;
