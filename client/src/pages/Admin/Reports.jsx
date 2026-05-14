import React, { useState } from 'react';
import Card from '../../components/Card/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Download, TrendingUp, AlertCircle, Filter, Zap } from 'lucide-react';
import { useAlert } from '../../context/AlertContext';
import { formatINR, formatINRCompact } from '../../utils/formatCurrency';

const revenueData = [
  { name: 'Jan', revenue: 145000 },
  { name: 'Feb', revenue: 172000 },
  { name: 'Mar', revenue: 168000 },
  { name: 'Apr', revenue: 194000 },
  { name: 'May', revenue: 221000 },
  { name: 'Jun', revenue: 248000 },
];

const customerDistribution = [
  { name: 'JioFiber 100', value: 400 },
  { name: 'Airtel Xstream 200', value: 300 },
  { name: 'GTPL Fiber 300', value: 300 },
];
const COLORS = ['#3b82f6', '#8b5cf6', '#10b981'];

const uptimeData = [
  { name: 'Mon', percentage: 99.9 },
  { name: 'Tue', percentage: 99.8 },
  { name: 'Wed', percentage: 99.9 },
  { name: 'Thu', percentage: 100 },
  { name: 'Fri', percentage: 98.5 },
  { name: 'Sat', percentage: 99.9 },
  { name: 'Sun', percentage: 100 },
];

const AdminReports = () => {
  const [filter, setFilter] = useState('YTD');
  const { showAlert } = useAlert();

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2>Analytics & Reports</h2>
          <p className="text-muted">Generate comprehensive network and business insights</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 bg-gray-800 rounded-md p-1" style={{ background: 'rgba(255,255,255,0.05)' }}>
             <button className={`btn py-1 px-3 text-sm ${filter === '30D' ? 'bg-primary' : 'bg-transparent text-muted'} border-none`} onClick={() => setFilter('30D')}>30 Days</button>
             <button className={`btn py-1 px-3 text-sm ${filter === 'YTD' ? 'bg-primary' : 'bg-transparent text-muted'} border-none`} onClick={() => setFilter('YTD')}>YTD</button>
             <button className={`btn py-1 px-3 text-sm ${filter === 'ALL' ? 'bg-primary' : 'bg-transparent text-muted'} border-none`} onClick={() => setFilter('ALL')}>All Time</button>
          </div>
          <button className="btn btn-outline" onClick={() => showAlert('Downloading full PDF report...', 'info')}>
            <Download size={18} /> Export CSV
          </button>
        </div>
      </div>

      <div className="flex gap-6 mb-8">
        <div style={{ flex: 2, height: '350px' }} className="glass-card p-6">
          <h3 className="mb-4 text-muted flex justify-between">
             <span>Revenue Breakdown</span>
             <span className="text-primary text-sm font-bold">+15% vs Last Year</span>
          </h3>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" tickFormatter={(value) => formatINRCompact(value)} />
              <Tooltip
                cursor={{fill: 'rgba(255,255,255,0.05)'}}
                formatter={(value) => formatINR(value)}
                contentStyle={{ backgroundColor: '#151a2a', borderColor: '#3b82f6' }}
              />
              <Bar dataKey="revenue" fill="url(#colorRev)" radius={[4, 4, 0, 0]} />
              <defs>
                 <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.4}/>
                 </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ flex: 1, height: '350px' }} className="glass-card p-6">
          <h3 className="mb-4 text-muted">Active Plan Subscriptions</h3>
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie
                data={customerDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {customerDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#151a2a', borderColor: '#8b5cf6' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {customerDistribution.map((entry, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full mb-1" style={{backgroundColor: COLORS[index]}}></div>
                <span className="text-xs text-muted">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-6 mb-8">
         <div style={{ flex: 2, height: '300px' }} className="glass-card p-6">
           <h3 className="mb-4 text-muted">Hardware & Network Uptime (7 Days)</h3>
           <ResponsiveContainer width="100%" height="90%">
             <AreaChart data={uptimeData}>
               <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
               <XAxis dataKey="name" stroke="#9ca3af" />
               <YAxis domain={['dataMin - 1', 100]} stroke="#9ca3af" tickFormatter={(v) => `${v}%`} />
               <Tooltip contentStyle={{ backgroundColor: '#151a2a', borderColor: '#10b981' }} />
               <Area type="monotone" dataKey="percentage" stroke="#10b981" fill="#10b981" fillOpacity={0.2} strokeWidth={3} />
             </AreaChart>
           </ResponsiveContainer>
         </div>

         <div className="flex flex-col gap-6" style={{ flex: 1 }}>
           <Card title="Avg Customer Acquisition Cost" value={formatINR(850)} icon={TrendingUp} trend={-5.2} className="flex-1" />
           <Card title="Avg Customer Churn Rate" value="1.2%" icon={AlertCircle} trend={0.1} className="flex-1" />
           <Card title="Network Reliability Score" value="99.8%" icon={Zap} trend={0.5} className="flex-1 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]" />
         </div>
      </div>
    </div>
  );
};

export default AdminReports;
