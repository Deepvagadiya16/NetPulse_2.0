import React, { useEffect, useState } from 'react';
import Table from '../../components/Table/Table';
import { LifeBuoy, Send, MessageSquare } from 'lucide-react';
import api from '../../services/api';
import { useAlert } from '../../context/AlertContext';

const mapTicket = (ticket) => ({
  ...ticket,
  id: ticket._id.substring(ticket._id.length - 8).toUpperCase(),
  date: new Date(ticket.createdAt).toLocaleDateString(),
});

const Support = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [issueText, setIssueText] = useState('');
  const [category, setCategory] = useState('Connection');
  const [priority, setPriority] = useState('Normal');
  const [submitting, setSubmitting] = useState(false);
  const { showAlert } = useAlert();

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const { data } = await api.get('/customer/tickets');
        setTickets(data.map(mapTicket));
      } catch (error) {
        console.error('Error fetching tickets:', error);
        showAlert('Failed to fetch your ticket history.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [showAlert]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { data } = await api.post('/customer/tickets', {
        issue: issueText,
        category,
        priority,
      });

      setTickets((currentTickets) => [mapTicket(data), ...currentTickets]);
      setIssueText('');
      setCategory('Connection');
      setPriority('Normal');
      showAlert('Ticket submitted successfully!', 'success');
    } catch (error) {
      showAlert(error.response?.data?.message || 'Failed to submit ticket.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { header: 'Ticket ID', accessor: 'id' },
    { header: 'Category', accessor: 'category' },
    { header: 'Reported Issue', accessor: 'issue' },
    { header: 'Date', accessor: 'date' },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <span className={`badge ${row.status === 'Resolved' ? 'badge-success' : 'badge-warning'}`}>
          {row.status}
        </span>
      ),
    },
  ];

  return (
    <div className="animate-fade-in max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-3">Help & Customer Support</h1>
        <p className="text-muted text-lg leading-relaxed max-w-2xl mx-auto">Get assistance with your connection, billing, or hardware issues.</p>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-4xl mx-auto space-y-10 mb-16">
        {/* Ticket Submission Form */}
        <div className="glass-card p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary bg-opacity-20 flex items-center justify-center">
              <LifeBuoy size={20} className="text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Submit a New Ticket</h3>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="input-label text-sm font-medium">Issue Category</label>
                <select className="input-field w-full" value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="Connection">Connection / Speed Issue</option>
                  <option value="Hardware">Hardware / Router Issue</option>
                  <option value="Billing">Billing / Account Inquiry</option>
                  <option value="Other">Setting up new device</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="input-label text-sm font-medium">Priority Level</label>
                <select className="input-field w-full" value={priority} onChange={(e) => setPriority(e.target.value)}>
                  <option value="Normal">Normal</option>
                  <option value="High">High (No Internet)</option>
                  <option value="Urgent">Urgent (Business Interruption)</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="input-label text-sm font-medium">Detailed Description</label>
              <textarea
                className="input-field w-full"
                rows="5"
                placeholder="Please provide specifics (e.g. lights on your router, error messages, when it started)..."
                required
                value={issueText}
                onChange={(e) => setIssueText(e.target.value)}
              ></textarea>
            </div>
            <button type="submit" className="btn btn-primary w-full flex justify-center items-center gap-3 py-4 text-base font-medium" disabled={submitting}>
              <Send size={20} /> {submitting ? 'Creating Ticket...' : 'Submit Support Request'}
            </button>
          </form>
        </div>
      </div>

      {/* Ticket History Section */}
      <div className="mt-8">
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-3">
            <MessageSquare size={24} className="text-primary" />
            <h3 className="text-xl font-semibold">Ticket History & Status</h3>
          </div>
        </div>
        {loading ? (
          <div className="glass-card p-8 text-center">
            <div className="animate-pulse text-muted">Loading your support history...</div>
          </div>
        ) : (
          <Table columns={columns} data={tickets} emptyMessage="No tickets found in your history." />
        )}
      </div>
    </div>
  );
};

export default Support;
