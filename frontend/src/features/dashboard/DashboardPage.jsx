import { useState, useEffect } from 'react';
import StatCard from '../../components/common/StatCard';
import LiveAlertsFeed from './LiveAlertsFeed';
import FraudRingSummary from './FraudRingSummary';
import HighRiskAccounts from './HighRiskAccounts';
import { Shield, ShieldAlert, PhoneOff, AlertTriangle, Network, MapPin } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { dashboardApi } from '../../api/dashboard.api';


export default function DashboardPage() {
  const [data, setData] = useState({
    overview: null,
    alerts: [],
    highRisk: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboard = async () => {
    try {
      // In a real app we'd fetch all these in parallel using Promise.all
      const overviewRes = await dashboardApi.getOverview();
      const alertsRes = await dashboardApi.getAlerts(null, false, 20);
      
      setData({
        overview: overviewRes.data,
        alerts: alertsRes.data.alerts,
        highRisk: [], // Will use dummy in component
      });
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    const interval = setInterval(loadDashboard, 30000); // Auto refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const handleResolveAlert = (id) => {
    setData(prev => ({
      ...prev,
      alerts: prev.alerts.map(a => a.alert_id === id ? { ...a, is_resolved: true } : a)
    }));
  };

  if (!data.overview) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-500" />
            Command Center
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Live public safety intelligence and automated threat neutralization.
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Scams Blocked"
          value={data.overview.total_scams_blocked?.toLocaleString() || "0"}
          icon={ShieldAlert}
          colorClass="text-emerald-400"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Active Fraud Rings"
          value={data.overview.active_fraud_rings?.toString() || "0"}
          icon={Network}
          colorClass="text-purple-400"
          trend={{ value: 5, isPositive: false }}
        />
        <StatCard
          title="Critical Hotspots"
          value={data.overview.critical_hotspots?.toString() || "0"}
          icon={MapPin}
          colorClass="text-red-400"
        />
        <StatCard
          title="Counterfeit Reports"
          value={data.overview.counterfeit_detected?.toString() || "0"}
          icon={AlertTriangle}
          colorClass="text-orange-400"
          trend={{ value: 2, isPositive: false }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Main Chart & Table */}
        <div className="lg:col-span-8 space-y-6">
          {/* Trend Chart */}
          <div className="glass-card p-5 border border-gray-700/50">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <PhoneOff className="w-4 h-4 text-blue-400" />
              Scam Attempts vs Blocked (Last 7 Days)
            </h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.overview.trends?.scams_last_7_days || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorScams" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorBlocked" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '8px' }}
                    itemStyle={{ color: '#f3f4f6' }}
                  />
                  <Area type="monotone" dataKey="scams" stroke="#ef4444" fillOpacity={1} fill="url(#colorScams)" name="Attempts" />
                  <Area type="monotone" dataKey="blocked" stroke="#10b981" fillOpacity={1} fill="url(#colorBlocked)" name="Blocked" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* High Risk Accounts Table */}
          <HighRiskAccounts accounts={data.highRisk} />
        </div>

        {/* Right Column - Feeds */}
        <div className="lg:col-span-4 space-y-6 flex flex-col">
          {/* Alerts Feed */}
          <div className="h-[400px]">
            <LiveAlertsFeed alerts={data.alerts} onResolve={handleResolveAlert} />
          </div>

          {/* Fraud Rings */}
          <div className="flex-1 min-h-[250px]">
            <FraudRingSummary data={data.overview} />
          </div>
        </div>
      </div>
    </div>
  );
}
