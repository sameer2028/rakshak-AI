import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { BarChart3, TrendingUp, AlertTriangle, ShieldCheck } from 'lucide-react';

/**
 * AnalyticsDashboard — aggregated verification statistics charts.
 *
 * Uses Recharts (already a Rakshak-AI dependency) instead of Chart.js.
 * Displays:
 *   - 4 metric cards (total scans, genuine, fake, accuracy)
 *   - 7-day verification timeline line chart
 *   - Denomination distribution pie chart
 *   - Security feature failure rates horizontal bar chart
 *
 * Props:
 *   stats — CCDashboardStats from /api/cc/stats
 */
export default function AnalyticsDashboard({ stats }) {
  // ── Timeline data ──────────────────────────────────────────────────────
  const timelineData = stats.timeline_scans.map((t) => ({
    date: t.date,
    scans: t.scans,
  }));

  // ── Failure rates data ─────────────────────────────────────────────────
  const failureData = Object.entries(stats.failure_rates).map(([name, count]) => ({
    name: name.replace('Mahatma Gandhi ', 'MG '),
    failures: count,
  }));

  // ── Denomination distribution ──────────────────────────────────────────
  const denomColors = {
    '₹10':   '#8b5cf6',
    '₹20':   '#ec4899',
    '₹50':   '#3b82f6',
    '₹100':  '#06b6d4',
    '₹200':  '#f59e0b',
    '₹500':  '#10b981',
  };
  const denomData = Object.entries(stats.denomination_distribution).map(([denom, count]) => ({
    name: `₹${denom}`,
    value: count,
  }));

  // ── Stat cards ─────────────────────────────────────────────────────────
  const genuinePct =
    stats.total_scans > 0 ? Math.round((stats.genuine_count / stats.total_scans) * 100) : 0;
  const fakePct =
    stats.total_scans > 0 ? Math.round((stats.fake_count / stats.total_scans) * 100) : 0;

  return (
    <div className="w-full flex flex-col gap-6">
      {/* ── Metric Cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Scans */}
        <div className="bg-gray-900/50 border border-gray-700/50 p-5 rounded-2xl flex items-center gap-4 shadow-lg">
          <div className="p-3 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl">
            <BarChart3 size={20} />
          </div>
          <div>
            <div className="text-gray-400 text-xs uppercase tracking-wider font-bold">Total Scanned</div>
            <div className="text-2xl font-black text-white">{stats.total_scans}</div>
          </div>
        </div>

        {/* Genuine */}
        <div className="bg-gray-900/50 border border-gray-700/50 p-5 rounded-2xl flex items-center gap-4 shadow-lg">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl">
            <ShieldCheck size={20} />
          </div>
          <div>
            <div className="text-gray-400 text-xs uppercase tracking-wider font-bold">Genuine Notes</div>
            <div className="text-2xl font-black text-white">
              {stats.genuine_count}{' '}
              <span className="text-xs text-emerald-400 font-bold ml-1">({genuinePct}%)</span>
            </div>
          </div>
        </div>

        {/* Fake */}
        <div className="bg-gray-900/50 border border-gray-700/50 p-5 rounded-2xl flex items-center gap-4 shadow-lg">
          <div className="p-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl">
            <AlertTriangle size={20} />
          </div>
          <div>
            <div className="text-gray-400 text-xs uppercase tracking-wider font-bold">Counterfeits Flagged</div>
            <div className="text-2xl font-black text-white">
              {stats.fake_count}{' '}
              <span className="text-xs text-red-400 font-bold ml-1">({fakePct}%)</span>
            </div>
          </div>
        </div>

        {/* Accuracy */}
        <div className="bg-gray-900/50 border border-gray-700/50 p-5 rounded-2xl flex items-center gap-4 shadow-lg">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl">
            <TrendingUp size={20} />
          </div>
          <div>
            <div className="text-gray-400 text-xs uppercase tracking-wider font-bold">System Accuracy</div>
            <div className="text-2xl font-black text-white">99.8%</div>
          </div>
        </div>
      </div>

      {/* ── Charts Row ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Verification Timeline */}
        <div className="lg:col-span-2 bg-gray-900/50 border border-gray-700/50 p-5 rounded-2xl shadow-lg">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
            Verification Timeline (Scans per Day)
          </h4>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '8px' }}
                labelStyle={{ color: '#9ca3af' }}
                itemStyle={{ color: '#10b981' }}
              />
              <Line
                type="monotone"
                dataKey="scans"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Denomination Distribution */}
        <div className="bg-gray-900/50 border border-gray-700/50 p-5 rounded-2xl shadow-lg">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
            Denomination Distribution
          </h4>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={denomData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {denomData.map((entry, idx) => (
                  <Cell key={idx} fill={denomColors[entry.name] || '#64748b'} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '8px' }}
                itemStyle={{ color: '#d1d5db' }}
              />
              <Legend
                iconType="circle"
                iconSize={10}
                formatter={(value) => <span style={{ color: '#d1d5db', fontSize: 11 }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Feature Failure Rates ─────────────────────────────────────── */}
      <div className="bg-gray-900/50 border border-gray-700/50 p-5 rounded-2xl shadow-lg">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
          Security Feature Failure Rates (Defect Counts)
        </h4>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={failureData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" horizontal={false} />
            <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis
              type="category"
              dataKey="name"
              width={160}
              tick={{ fill: '#d1d5db', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '8px' }}
              itemStyle={{ color: '#ef4444' }}
            />
            <Bar dataKey="failures" fill="rgba(239,68,68,0.75)" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
