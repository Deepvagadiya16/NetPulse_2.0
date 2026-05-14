import React, { useEffect, useState } from 'react';
import { MapPin, AlertCircle, Clock, Camera, CheckSquare, Bell, Star, CheckCircle, Phone } from 'lucide-react';
import Card from '../../components/Card/Card';
import Table from '../../components/Table/Table';
import api from '../../services/api';

const notifications = [
  { id: 1, text: 'New high-priority task assigned in Area C.', time: '10 mins ago', type: 'alert' },
  { id: 2, text: 'Schedule update: Your shift ends at 6 PM today.', time: '1 hour ago', type: 'info' },
  { id: 3, text: "Inventory check required for 'Fiber Splitter X-1'.", time: '2 hours ago', type: 'warning' },
];

const TechnicianDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completedToday, setCompletedToday] = useState(0);
  const [closingTask, setClosingTask] = useState(null);
  const [report, setReport] = useState({ notes: '', photoUploaded: false, resolution: 'Hardware Replaced' });

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const { data } = await api.get('/technician/tasks');
        setTasks(data.map((task) => ({
          ...task,
          id: task._id.substring(task._id.length - 8).toUpperCase(),
          customer: task.customerId?.name || 'Unknown',
          location: task.customerId?.address || 'Field Visit Required',
          type: task.category || 'Support',
        })));
        setCompletedToday(data.filter((task) => task.status === 'Completed' || task.status === 'Resolved').length);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const openCloseTicketModal = (task) => {
    setClosingTask(task);
    setReport({ notes: '', photoUploaded: false, resolution: 'Hardware Replaced' });
  };

  const startTask = async (id, actualId) => {
    try {
      await api.patch(`/technician/tasks/${actualId}`, { status: 'In Progress' });
      setTasks(tasks.map((task) => (task.id === id ? { ...task, status: 'In Progress' } : task)));
    } catch (error) {
      alert('Failed to start job.');
    }
  };

  const submitCloseTicket = async (e) => {
    e.preventDefault();

    try {
      await api.patch(`/technician/tasks/${closingTask._id}`, {
        status: 'Resolved',
        notes: report.notes,
        resolutionCode: report.resolution,
      });

      setTasks(tasks.filter((task) => task.id !== closingTask.id));
      setCompletedToday((prev) => prev + 1);
      setClosingTask(null);
      setReport({ notes: '', photoUploaded: false, resolution: 'Hardware Replaced' });
      alert('Job report submitted successfully!');
    } catch (error) {
      alert('Failed to close job.');
    }
  };

  const columns = [
    { header: 'Ticket ID', accessor: 'id' },
    { header: 'Type', accessor: 'type' },
    { header: 'Customer', accessor: 'customer' },
    { header: 'Location', accessor: 'location' },
    {
      header: 'Priority',
      accessor: 'priority',
      render: (row) => (
        <span className={`badge ${row.priority === 'High' || row.priority === 'Urgent' ? 'badge-danger' : 'badge-primary'}`}>
          {row.priority}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <span className={`badge ${row.status === 'In Progress' ? 'badge-warning' : 'badge-primary'}`}>
          {row.status}
        </span>
      ),
    },
    {
      header: 'Action',
      accessor: 'action',
      render: (row) => (
        row.status === 'Open' || row.status === 'Pending' ? (
          <button className="btn btn-outline py-1 px-3 text-sm flex gap-1 items-center" onClick={() => startTask(row.id, row._id)}>
            Start Job
          </button>
        ) : (
          <button className="btn btn-success py-1 px-3 text-sm flex gap-1 items-center" onClick={() => openCloseTicketModal(row)}>
            <CheckSquare size={14} /> Finish & Report
          </button>
        )
      ),
    },
  ];

  if (loading) {
    return <div className="p-20 text-center"><h3>Loading technician dashboard...</h3></div>;
  }

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2>Technician Field Hub</h2>
          <p className="text-muted">Real-time task management and field reporting portal.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end mr-2">
            <span className="text-sm font-bold">Tech Dashboard</span>
            <span className="text-10px text-muted flex items-center gap-1"><Star size={10} className="text-warning fill-warning" /> 4.9 Rating</span>
          </div>
          <span className="flex items-center gap-2 text-sm font-bold text-success">
            <span className="w-3 h-3 rounded-full bg-success animate-pulse"></span>
            ACTIVE SESSION
          </span>
        </div>
      </div>

      <div className="flex gap-6 mb-8">
        <div style={{ flex: 2.5 }} className="flex flex-col gap-6">
          <div className="grid grid-cols-3 gap-6">
            <Card title="Open Tasks" value={tasks.length.toString()} icon={AlertCircle} />
            <Card title="Jobs Complete" value={completedToday.toString()} icon={CheckSquare} trend={12} />
            <Card title="Shift Goal" value="85%" icon={Star} />
          </div>

          <div>
            <h3 className="mb-4">My Dashboard & Assignments</h3>
            <Table columns={columns} data={tasks} emptyMessage="All clear! No pending jobs assigned to you right now." />
          </div>
        </div>

        <div style={{ flex: 1 }} className="flex flex-col gap-6">


          <div className="glass-card p-6 bg-[rgba(255,255,255,0.02)]">
            <h4 className="mb-4 flex items-center gap-2"><MapPin size={18} className="text-primary" /> Region Status</h4>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted">Active Sector:</span>
                <span className="font-bold text-success">Sector A-4 (Normal)</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted">Avg. Dispatch:</span>
                <span>14 Mins</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted">Weather Alert:</span>
                <span className="text-warning font-medium">Cloudy</span>
              </div>
            </div>
          </div>

          
        </div>
      </div>

      {closingTask && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(5px)' }}>
          <div className="glass-card animate-fade-in shadow-2xl" style={{ width: '500px', padding: '2rem', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-primary flex items-center gap-2"><CheckSquare /> Job Completion Report</h3>
              <span className="badge badge-primary">{closingTask.id}</span>
            </div>

            <form onSubmit={submitCloseTicket}>
              <div className="input-group">
                <label className="input-label">Resolution Code</label>
                <select className="input-field" value={report.resolution} onChange={(e) => setReport({ ...report, resolution: e.target.value })}>
                  <option>Hardware Replaced</option>
                  <option>Line Spliced / Repaired</option>
                  <option>New Customer Installation</option>
                  <option>Issue Could Not Be Reproduced</option>
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Closing Notes / Feedback</label>
                <textarea className="input-field" required rows="3" placeholder="Outline the steps taken to fix the issue..." value={report.notes} onChange={(e) => setReport({ ...report, notes: e.target.value })}></textarea>
              </div>

              <div className="input-group">
                <label className="input-label">Proof of Work (Photo Required)</label>
                <div className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${report.photoUploaded ? 'border-success bg-[rgba(16,185,129,0.05)] text-success' : 'border-[rgba(255,255,255,0.1)] text-muted hover:border-primary hover:text-primary hover:bg-[rgba(59,130,246,0.05)]'}`} onClick={() => setReport({ ...report, photoUploaded: !report.photoUploaded })}>
                  {report.photoUploaded ? (
                    <div>
                      <CheckCircle size={24} className="mx-auto mb-2 animate-bounce" />
                      <p className="text-sm font-bold">WORK_PHOTO_821.JPG ATTACHED</p>
                      <p className="text-10px opacity-70">Click to remove</p>
                    </div>
                  ) : (
                    <div>
                      <Camera size={24} className="mx-auto mb-2" />
                      <p className="text-sm">Click to simulate taking a picture of the fix</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button type="button" className="btn btn-outline flex-1" onClick={() => setClosingTask(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary flex-1" disabled={!report.photoUploaded}>Complete Assignment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechnicianDashboard;
