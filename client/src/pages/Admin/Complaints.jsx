import React, { useEffect, useState } from 'react';
import Table from '../../components/Table/Table';
import Card from '../../components/Card/Card';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import api from '../../services/api';
import { useAlert } from '../../context/AlertContext';

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [viewTicket, setViewTicket] = useState(null);
  const [assignment, setAssignment] = useState('');
  const { showAlert } = useAlert();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [complaintRes, techRes] = await Promise.all([
          api.get('/complaints'),
          api.get('/admin/technicians'),
        ]);

        setComplaints(complaintRes.data);
        setTechnicians(techRes.data.filter((tech) => tech.role === 'Technician'));
      } catch (error) {
        showAlert('Failed to fetch complaints', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [showAlert]);

  const resolveTicket = async (id) => {
    try {
      const { data } = await api.patch(`/complaints/${id}`, { status: 'Resolved' });
      setComplaints(complaints.map((ticket) => (ticket._id === id ? data : ticket)));
      if (viewTicket?._id === id) {
        setViewTicket(data);
      }
      showAlert('Ticket resolved successfully', 'success');
    } catch (error) {
      showAlert('Failed to update status', 'error');
    }
  };

  const assignTech = async (e) => {
    e.preventDefault();

    if (assignment) {
      try {
        const { data } = await api.patch(`/complaints/${viewTicket._id}`, { technicianId: assignment });
        setComplaints(complaints.map((ticket) => (ticket._id === data._id ? data : ticket)));
        setViewTicket(data);
        setAssignment('');
        showAlert('Technician assigned', 'success');
      } catch (error) {
        showAlert('Failed to assign technician', 'error');
      }
    }
  };

  const filteredComplaints = complaints.filter((complaint) => (filter === 'All' ? true : complaint.status === filter));

  const columns = [
    {
      header: 'Ticket ID',
      accessor: '_id',
      render: (row) => row._id?.substring(row._id.length - 6).toUpperCase() || 'N/A',
    },
    {
      header: 'Customer',
      accessor: 'customer',
      render: (row) => row.customerId?.name || 'Unknown',
    },
    { header: 'Summary', accessor: 'issue', render: (row) => `${row.issue.substring(0, 30)}...` },
    {
      header: 'Date',
      accessor: 'createdAt',
      render: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      header: 'Priority',
      accessor: 'priority',
      render: (row) => {
        let badgeClass = 'badge-primary';
        if (row.priority === 'Urgent') badgeClass = 'badge-danger';
        if (row.priority === 'High') badgeClass = 'badge-warning';
        return <span className={`badge ${badgeClass}`}>{row.priority}</span>;
      },
    },
    {
      header: 'Tech Assigned',
      accessor: 'technicianId',
      render: (row) => row.technicianId?.name ? row.technicianId.name : <span className="text-muted text-sm italic">Unassigned</span>,
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <span className={`badge ${row.status === 'Resolved' ? 'badge-success' : 'badge-primary'}`}>
          {row.status}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <div className="flex gap-2">
          <button className="btn btn-outline py-1 px-3 text-sm flex items-center" onClick={() => setViewTicket(row)}>
            Details
          </button>
          {row.status !== 'Resolved' && (
            <button className="btn btn-primary py-1 px-3 text-sm flex items-center gap-1" onClick={() => resolveTicket(row._id)}>
              <CheckCircle size={14} /> Close
            </button>
          )}
        </div>
      ),
    },
  ];

  if (loading) {
    return <div className="p-20 text-center"><h3>Loading complaints...</h3></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2>Support Tickets & Complaints</h2>
          <p className="text-muted">Resolve customer network issues and dispatch field agents</p>
        </div>
        <div className="flex gap-2">
          <button className={`btn btn-sm ${filter === 'All' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter('All')}>All Tickets</button>
          <button className={`btn btn-sm ${filter === 'Open' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter('Open')}>Open</button>
          <button className={`btn btn-sm ${filter === 'Resolved' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter('Resolved')}>Resolved</button>
        </div>
      </div>

      <div className="grid-summary flex gap-6 mb-8">
        <div style={{ flex: 1 }}>
          <Card title="Open Escalations" value={complaints.filter((complaint) => complaint.status === 'Open').length.toString()} icon={AlertTriangle} trend={12} />
        </div>
        <div style={{ flex: 1 }}>
          <Card title="Unassigned Tickets" value={complaints.filter((complaint) => complaint.status === 'Open' && !complaint.technicianId).length.toString()} icon={Clock} />
        </div>
        <div style={{ flex: 1 }}>
          <Card title="Resolved Today" value={complaints.filter((complaint) => complaint.status === 'Resolved').length.toString()} icon={CheckCircle} trend={50} />
        </div>
      </div>

      <Table columns={columns} data={filteredComplaints} emptyMessage={`No ${filter !== 'All' ? filter : ''} complaints recorded.`} />

      {viewTicket && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-card animate-fade-in" style={{ width: '550px', padding: '2rem' }}>
            <div className="flex justify-between items-center mb-4 border-b border-[rgba(255,255,255,0.1)] pb-4">
              <div>
                <h3 className="text-xl">{viewTicket._id.substring(viewTicket._id.length - 8).toUpperCase()}</h3>
                <p className="text-sm text-primary font-medium mt-1">Customer: {viewTicket.customerId?.name}</p>
              </div>
              <div className="text-right">
                <span className={`badge ${viewTicket.status === 'Resolved' ? 'badge-success' : 'badge-primary'} mb-2`}>{viewTicket.status}</span>
                <p className="text-xs text-muted">Created: {new Date(viewTicket.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="mb-6 p-4 rounded bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
              <h4 className="text-sm font-semibold text-muted mb-2 uppercase">Full Defect / Issue</h4>
              <p className="text-[15px]">{viewTicket.issue}</p>
            </div>

            <div className="mb-6">
              <h4 className="text-sm font-semibold text-muted mb-2 uppercase">Dispatch Assignment</h4>
              {viewTicket.technicianId ? (
                <div className="flex items-center gap-2 p-3 bg-primary-light text-primary rounded-md border border-[rgba(59,130,246,0.2)]">
                  <CheckCircle size={16} /> <span>Assigned proactively to: <strong>{viewTicket.technicianId.name}</strong></span>
                </div>
              ) : (
                <form onSubmit={assignTech} className="flex gap-2">
                  <select className="input-field flex-1" style={{ backgroundColor: 'var(--bg-surface)' }} required value={assignment} onChange={(e) => setAssignment(e.target.value)}>
                    <option value="" disabled>Select Technician...</option>
                    {technicians.map((tech) => (
                      <option key={tech._id} value={tech._id}>{tech.name} ({tech.location || 'HQ'})</option>
                    ))}
                  </select>
                  <button type="submit" className="btn btn-primary">Assign</button>
                </form>
              )}
            </div>

            <div className="mt-8 flex justify-end gap-4">
              {viewTicket.status !== 'Resolved' && (
                <button className="btn btn-outline text-danger border-danger-bg hover:bg-danger-bg" onClick={() => { resolveTicket(viewTicket._id); setViewTicket(null); }}>
                  Force Close Ticket
                </button>
              )}
              <button className="btn btn-outline" onClick={() => setViewTicket(null)}>Close Dashboard</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminComplaints;
