import { useState, useEffect } from 'react';
import { Banknote, BarChart3, History, RefreshCw, Eye, Cpu, Network, ShieldCheck } from 'lucide-react';
import api from '../../api/client';

import UploadSection from './UploadSection';
import ReportView from './ReportView';
import FeatureInspector from './FeatureInspector';
import AnalyticsDashboard from './AnalyticsDashboard';
import HistoryTable from './HistoryTable';

/**
 * CounterfeitPage — main page for Counterfeit Currency Detection module.
 *
 * Tabs:
 *   Scanner Console  — upload + full verification result (report + bounding boxes)
 *   Analytics Vault  — aggregated stats charts
 *   Audit History    — searchable/filterable history table
 *
 * All API calls use Rakshak-AI's authenticated axios client (JWT Bearer token).
 */
export default function CounterfeitPage() {
  const [activeTab, setActiveTab] = useState('scanner');
  const [verificationResult, setVerificationResult] = useState(null);
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [statsLoading, setStatsLoading] = useState(false);

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const response = await api.get('/cc/stats');
      setStats(response.data);
    } catch (err) {
      console.error('Failed to fetch CC statistics:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await api.get('/cc/history?limit=50');
      setHistory(response.data);
    } catch (err) {
      console.error('Failed to fetch CC history:', err);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchHistory();
  }, []);

  const handleVerificationComplete = (data) => {
    setVerificationResult(data);
    // Refresh analytics after new scan
    fetchStats();
    fetchHistory();
  };

  const tabs = [
    { id: 'scanner', label: 'Scanner Console', icon: <Banknote size={15} /> },
    { id: 'analytics', label: 'Analytics Vault', icon: <BarChart3 size={15} /> },
    { id: 'history', label: 'Audit History', icon: <History size={15} /> },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-0 animate-fade-in">
      {/* Page header */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Banknote className="w-8 h-8 text-cyan-400" />
            Counterfeit Currency Detection
          </h1>
          <p className="text-gray-400 mt-2 text-sm">
            AI-powered multi-stage security feature verification using YOLOv11, EasyOCR, and EfficientNetV2.
          </p>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-2 border-b border-gray-800 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold tracking-wide transition-all border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Scanner Console ───────────────────────────────────────────── */}
      {activeTab === 'scanner' && (
        <div className="flex flex-col gap-8">
          <UploadSection onVerificationComplete={handleVerificationComplete} />

          {verificationResult && (
            <>
              {/* Verdict + Grad-CAM + OCR + Checklist */}
              <ReportView data={verificationResult} />

              {/* Interactive bounding boxes + feature magnifier */}
              <FeatureInspector data={verificationResult} />
            </>
          )}

          {!verificationResult && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in stagger-2">
              {/* Card 1: Optical Preprocessing */}
              <div className="bg-gray-900/40 border border-gray-800/80 rounded-2xl p-6 hover:border-cyan-500/30 transition-all duration-300 group flex flex-col justify-between relative overflow-hidden">
                <div className="absolute -right-4 -top-4 text-cyan-500/5 group-hover:text-cyan-500/10 transition-colors pointer-events-none">
                  <Eye size={120} />
                </div>
                <div>
                  <div className="p-3 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-xl inline-block mb-4">
                    <Eye size={22} />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">Stage 1: Preprocessing & CLAHE</h3>
                  <p className="text-gray-400 text-xs leading-relaxed">
                    Applies Contrast Limited Adaptive Histogram Equalization (CLAHE) filters and localized thresholding masks to reveal hidden micro-prints, watermarks, and serial engravings.
                  </p>
                </div>
                <div className="text-[10px] uppercase tracking-wider font-extrabold text-cyan-400 mt-6 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
                  Image Optimization Grid Active
                </div>
              </div>

              {/* Card 2: Neural Bounding Analysis */}
              <div className="bg-gray-900/40 border border-gray-800/80 rounded-2xl p-6 hover:border-blue-500/30 transition-all duration-300 group flex flex-col justify-between relative overflow-hidden">
                <div className="absolute -right-4 -top-4 text-blue-500/5 group-hover:text-blue-500/10 transition-colors pointer-events-none">
                  <Network size={120} />
                </div>
                <div>
                  <div className="p-3 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl inline-block mb-4">
                    <Network size={22} />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">Stage 2: YOLOv11 Feature Anchoring</h3>
                  <p className="text-gray-400 text-xs leading-relaxed">
                    Deploying YOLOv11 convolutional neural networks to localize primary security landmarks: Mahatma Gandhi Watermark, Ashoka Pillar, RBI Seal, and the color-shifting Security Thread.
                  </p>
                </div>
                <div className="text-[10px] uppercase tracking-wider font-extrabold text-blue-400 mt-6 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                  Neural Anchors Ready
                </div>
              </div>

              {/* Card 3: OCR Alphanumeric Verification */}
              <div className="bg-gray-900/40 border border-gray-800/80 rounded-2xl p-6 hover:border-purple-500/30 transition-all duration-300 group flex flex-col justify-between relative overflow-hidden">
                <div className="absolute -right-4 -top-4 text-purple-500/5 group-hover:text-purple-500/10 transition-colors pointer-events-none">
                  <Cpu size={120} />
                </div>
                <div>
                  <div className="p-3 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-xl inline-block mb-4">
                    <Cpu size={22} />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">Stage 3: EasyOCR & Signature Diagnostics</h3>
                  <p className="text-gray-400 text-xs leading-relaxed">
                    Extracts the banknote serial number prefix and governor's signature block, cross-validating the format against standard RBI database structures.
                  </p>
                </div>
                <div className="text-[10px] uppercase tracking-wider font-extrabold text-purple-400 mt-6 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" />
                  EasyOCR Pipeline Configured
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Analytics Vault ───────────────────────────────────────────── */}
      {activeTab === 'analytics' && (
        <>
          {statsLoading ? (
            <div className="flex flex-col items-center justify-center py-24 text-gray-500">
              <RefreshCw size={24} className="animate-spin text-emerald-400 mb-2" />
              <p className="text-sm">Compiling analytics...</p>
            </div>
          ) : stats ? (
            <AnalyticsDashboard stats={stats} />
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-gray-500">
              <BarChart3 size={32} className="mb-3 opacity-30" />
              <p className="text-sm">No analytics data available. Run some verifications first.</p>
            </div>
          )}
        </>
      )}

      {/* ── Audit History ─────────────────────────────────────────────── */}
      {activeTab === 'history' && (
        <HistoryTable history={history} onRefresh={fetchHistory} />
      )}
    </div>
  );
}
