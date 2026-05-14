import React, { useState, useEffect } from 'react';
import { Search, Filter, Clock, MapPin, CheckCircle2, AlertCircle, Play, MoreVertical, ExternalLink } from 'lucide-react';
import Table from '../../components/Table/Table';
import api from '../../services/api';
import { useAlert } from '../../context/AlertContext';

const allTasks = [
  { id: 'TSK-1002', type: 'Repair', customer: 'John Doe', location: '123 Main St, Area A', status: 'In Progress', priority: 'High', date: '2026-04-05' },
  { id: 'TSK-1004', type: 'Installation', customer: 'Sarah Smith', location: '45 Park Ave, Area B', status: 'Pending', priority: 'Medium', date: '2026-04-05' },
  { id: 'TSK-0998', type: 'Maintenance', customer: 'Robert Brown', location: '78 Oak Road, Area C', status: 'Completed', priority: 'Low', date: '2026-04-04' },
  { id: 'TSK-1005', type: 'Repair', customer: 'Emily White', location: '12 Sky Tower, Area A', status: 'Pending', priority: 'High', date: '2026-04-05' },
  { id: 'TSK-0995', type: 'Installation', customer: 'Michael Green', location: '22 River Side, Area B', status: 'Completed', priority: 'Medium', date: '2026-04-03' },
];

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { showAlert } = useAlert();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const { data } = await api.get('/technician/tasks');
        setTasks(data.map(t => ({
          ...t,
          id: t._id.substring(t._id.length - 8).toUpperCase(),
          customer: t.customerId?.name || 'Unknown',
          location: t.customerId?.address || 'Field Visit Required',
          type: t.category || 'Support'
        })));
      } catch (error) {
        console.error("Error fetching tasks:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const filteredTasks = tasks.filter(task => {
    const matchesFilter = filter === 'All' || task.status === filter;
    const matchesSearch = task.customer.toLowerCase().includes(search.toLowerCase()) || 
                          task.id.toLowerCase().includes(search.toLowerCase()) ||
                          task.location.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const updateStatus = async (id, actualId, newStatus) => {
    try {
      await api.patch(`/technician/tasks/${actualId}`, { status: newStatus === 'Completed' ? 'Resolved' : newStatus });
      setTasks(tasks.map(task => task.id === id ? { ...task, status: newStatus === 'Completed' ? 'Resolved' : newStatus } : task));
      showAlert(`Task ${id} status updated to ${newStatus}`, "success");
    } catch (error) {
      showAlert("Failed to update status.", "error");
    }
  };

  const columns = [
    { header: 'Ticket ID', accessor: 'id' },
    { 
      header: 'Type', 
      accessor: 'type',
      render: (row) => (
        <span className="flex items-center gap-2">
           <div className={`w-2 h-2 rounded-full ${row.type === 'Connection' ? 'bg-danger' : row.type === 'Hardware' ? 'bg-primary' : 'bg-success'}`}></div>
           {row.type}
        </span>
      )
    },
    { header: 'Customer', accessor: 'customer' },
    { 
      header: 'Location', 
      accessor: 'location',
      render: (row) => (
        <div className="flex items-center gap-1 text-xs">
           <MapPin size={12} className="text-muted" /> {row.location}
        </div>
      )
    },
    { 
      header: 'Priority', 
      accessor: 'priority',
      render: (row) => (
        <span className={`badge ${row.priority === 'High' || row.priority === 'Urgent' ? 'badge-danger' : row.priority === 'Medium' ? 'badge-primary' : 'badge-success'}`}>
          {row.priority}
        </span>
      )
    },
    { 
      header: 'Status', 
      accessor: 'status',
      render: (row) => (
        <span className={`badge ${row.status === 'Resolved' || row.status === 'Completed' ? 'badge-success' : row.status === 'In Progress' ? 'badge-warning' : 'badge-primary'}`}>
          {row.status}
        </span>
      )
    },
    { 
      header: 'Action', 
      accessor: 'action',
      render: (row) => (
        <div className="flex gap-2">
          {(row.status === 'Pending' || row.status === 'Open') && (
            <button className="btn btn-primary py-1 px-2 text-xs flex items-center gap-1" onClick={() => updateStatus(row.id, row._id, 'In Progress')}>
               <Play size={10} /> Start
            </button>
          )}
          {row.status === 'In Progress' && (
            <button className="btn btn-success py-1 px-2 text-xs flex items-center gap-1" onClick={() => updateStatus(row.id, row._id, 'Completed')}>
               <CheckCircle2 size={10} /> Finish
            </button>
          )}
          <button className="btn btn-outline py-1 px-1 text-xs" title="View Details">
             <ExternalLink size={12} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2>Task Management</h2>
          <p className="text-muted">Browse and manage all your field assignments.</p>
        </div>
        <div className="flex gap-3">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
              <input 
                type="text" 
                placeholder="Search tasks..." 
                className="input-field pl-10 py-2 w-64"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
           </div>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        {['All', 'Open', 'In Progress', 'Resolved'].map(f => (
          <button 
            key={f}
            className={`btn ${filter === f ? 'btn-primary' : 'btn-outline'} py-2 px-6`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="glass-card mb-8">
         <div className="p-4 border-b border-[rgba(255,255,255,0.05)] flex justify-between items-center bg-[rgba(255,255,255,0.01)]">
            <h4 className="text-sm font-bold flex items-center gap-2">
               <Filter size={16} className="text-primary" /> Showing {filteredTasks.length} {filter !== 'All' ? filter : ''} Tasks
            </h4>
            
         </div>
         <Table columns={columns} data={filteredTasks} emptyMessage={`No tasks found matching filter: ${filter}`} />
      </div>
    </div>
  );
};

export default Tasks;
