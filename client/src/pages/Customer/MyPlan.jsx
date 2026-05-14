import React, { useEffect, useState } from 'react';
import { Wifi, Zap, Shield, Globe, ArrowRight, CheckCircle, Server, Activity } from 'lucide-react';
import Card from '../../components/Card/Card';
import api from '../../services/api';
import { formatINR } from '../../utils/formatCurrency';

const MyPlan = () => {
  const [currentPlan, setCurrentPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isChangingPlan, setIsChangingPlan] = useState(false);
  const [plans, setPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [isRecharging, setIsRecharging] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [planRes, plansRes] = await Promise.all([
          api.get('/customer/my-plan'),
          api.get('/plans')
        ]);
        setCurrentPlan(planRes.data);
        setPlans(plansRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const downloaded = currentPlan?.dataDownloaded || '452 GB';
  const uploaded = currentPlan?.dataUploaded || '86 GB';
  const usageLabel = currentPlan?.usageLimit || currentPlan?.dataLimit || 'Unlimited';
  const providerLabel = currentPlan?.provider || 'Indian Broadband';

  const planFeatures = [
    { icon: <Zap size={18} />, text: `Up to ${currentPlan?.speed || '100 Mbps'} speed` },
    { icon: <Shield size={18} />, text: 'Secure home internet with always-on protection' },
    { icon: <Globe size={18} />, text: `${providerLabel} broadband connection` },
    { icon: <Activity size={18} />, text: 'Smooth streaming, gaming, and video calls' },
    { icon: <Server size={18} />, text: `${currentPlan?.dataLimit || 'Unlimited'} Data Usage` },
  ];

  const handlePlanChange = () => {
    setIsChangingPlan(true);
    setTimeout(() => {
      alert('Plan change request submitted! Our agent will contact you to confirm.');
      setIsChangingPlan(false);
    }, 1500);
  };

  const handleRecharge = async () => {
    if (!selectedPlanId) {
      alert('Please select a plan to recharge');
      return;
    }

    setIsRecharging(true);
    try {
      await api.post('/customer/recharge', { planId: selectedPlanId });
      alert('Recharge request submitted. Waiting for admin approval.');
      // Refresh data
      const [planRes, plansRes] = await Promise.all([
        api.get('/customer/my-plan'),
        api.get('/plans')
      ]);
      setCurrentPlan(planRes.data);
      setPlans(plansRes.data);
      setSelectedPlanId('');
    } catch (error) {
      console.error('Error recharging plan:', error);
      alert('Failed to recharge plan. Please try again.');
    } finally {
      setIsRecharging(false);
    }
  };

  if (loading) return <div className="p-20 text-center"><h3>Syncing Subscription Data...</h3></div>;
  if (!currentPlan) return <div className="p-20 text-center"><h3>No active plan found.</h3></div>;

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2>Subscription & Plan</h2>
          <p className="text-muted">Review your current internet package and data usage statistics.</p>
        </div>
        <button
          className="btn btn-primary flex items-center gap-2"
          onClick={() => alert('Upgrade options are being prepared for your location.')}
        >
          Check Upgrades <ArrowRight size={18} />
        </button>
      </div>

      <div className="flex gap-6 mb-8">
        <div style={{ flex: 1.5 }}>
          <div className="glass-card p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="badge badge-primary mb-2">Current Package</span>
                <h1 className="text-3xl font-bold text-primary">{currentPlan.name}</h1>
                <p className="text-muted mt-1">{providerLabel} broadband - Monthly billing</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{formatINR(currentPlan.price)}/mo</div>
                <div className="text-sm text-muted mt-1">
                  Valid till: {currentPlan.validity ? new Date(currentPlan.validity).toLocaleDateString('en-IN') : 'N/A'}
                </div>
                <span className={`badge mt-2 ${currentPlan.status === 'Active' ? 'badge-success' : currentPlan.status === 'Pending' ? 'badge-warning' : 'badge-danger'}`}>
                  {currentPlan.status || 'Active'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-6 border-t border-[rgba(255,255,255,0.1)]">
              <div>
                <h4 className="text-muted mb-4 uppercase text-xs tracking-wider">Plan Highlights</h4>
                <div className="flex flex-col gap-3">
                  {planFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3 text-sm">
                      <span className="text-primary">{feature.icon}</span>
                      <span>{feature.text}</span>
                    </div>
                  ))}
                  {currentPlan.features?.map((feature, index) => (
                    <div key={`extra-${index}`} className="flex items-center gap-3 text-sm">
                      <CheckCircle size={18} className="text-success" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-[rgba(255,255,255,0.03)] p-4 rounded-xl">
                <h4 className="text-muted mb-4 uppercase text-xs tracking-wider">Network Details</h4>
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Max Speed:</span>
                    <span className="font-medium">{currentPlan.speed}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">MAC Address:</span>
                    <span className="font-mono">00:1A:2B:3C:4D:5E</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Public IP:</span>
                    <span className="font-mono">192.158.1.38</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Data Limit:</span>
                    <span className="font-medium text-warning">{currentPlan.dataLimit || 'Unlimited'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ flex: 1 }} className="flex flex-col gap-6">
          {/* Recharge Section */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Zap className="text-primary" size={20} />
              Recharge Your Plan
            </h3>
            <p className="text-muted text-sm mb-4">Select a plan to recharge and extend your validity instantly.</p>
            
            <div className="space-y-4">
              <div>
                <label className="input-label">Choose Plan</label>
                <select 
                  className="input-field" 
                  style={{ backgroundColor: 'var(--bg-surface)' }}
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                >
                  <option value="">-- Select Plan --</option>
                  {plans.map((plan) => (
                    <option key={plan._id} value={plan._id}>
                      {plan.name} - {formatINR(plan.price)}/month
                    </option>
                  ))}
                </select>
              </div>
              
              {selectedPlanId && (
                <div className="bg-[rgba(59,130,246,0.1)] p-3 rounded-lg">
                  <p className="text-sm">
                    <strong>Selected:</strong> {plans.find(p => p._id === selectedPlanId)?.name} - {formatINR(plans.find(p => p._id === selectedPlanId)?.price)}
                  </p>
                  <p className="text-xs text-muted mt-1">Request will be sent for admin approval</p>
                </div>
              )}
              
              <button 
                className="btn btn-primary w-full"
                onClick={handleRecharge}
                disabled={!selectedPlanId || isRecharging}
              >
                {isRecharging ? 'Processing Recharge...' : 'Recharge Now'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="mb-4">Standard Features Included</h3>
        <div className="grid grid-cols-4 gap-4">
          {[
            { title: '24/7 Support', desc: 'Expert help anytime you need.' },
            { title: 'Smart Router', desc: 'Dual-band Wi-Fi hardware included.' },
            { title: 'OTT Add-ons', desc: 'Popular streaming perks on select plans.' },
            { title: 'UPI Billing', desc: 'Fast monthly payments with Indian methods.' },
          ].map((item, idx) => (
            <div key={idx} className="glass-card p-4 border border-[rgba(255,255,255,0.05)]">
              <h4 className="text-primary text-sm mb-1">{item.title}</h4>
              <p className="text-xs text-muted">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyPlan;
