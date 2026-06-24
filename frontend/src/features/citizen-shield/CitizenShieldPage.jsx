import { useState, useEffect } from 'react';
import FraudCheckForm from './FraudCheckForm';
import AnalysisResult from './AnalysisResult';
import { citizenShieldApi } from '../../api/citizen-shield.api';
import { ShieldAlert, History, Shield, Loader2 } from 'lucide-react';
import VerdictBadge from '../../components/common/VerdictBadge';

export default function CitizenShieldPage() {
  const [activeTab, setActiveTab] = useState('check'); // 'check' or 'history'
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const handleFraudCheck = async (data) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await citizenShieldApi.checkFraud({
        message: data.message || undefined,
        phone_number: data.phone_number || undefined,
        upi_id: data.upi_id || undefined,
        email: data.email || undefined,
        source: data.source,
      });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred during analysis');
    } finally {
      setIsLoading(false);
    }
  };

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const response = await citizenShieldApi.getHistory();
      setHistory(response.data.reports);
    } catch (err) {
      console.error('Failed to load history', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') {
      loadHistory();
    }
  }, [activeTab]);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Shield className="w-8 h-8 text-blue-500" />
          Citizen Fraud Shield
        </h1>
        <p className="text-gray-400 mt-2">
          Verify suspicious messages, phone numbers, or UPI IDs instantly using AI.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-800">
        <button
          onClick={() => setActiveTab('check')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors relative ${
            activeTab === 'check' ? 'text-blue-400' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          New Scan
          {activeTab === 'check' && (
            <span className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-blue-500 rounded-t-full shadow-[0_-2px_10px_rgba(59,130,246,0.5)]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors relative ${
            activeTab === 'history' ? 'text-blue-400' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <History className="w-4 h-4" />
          My History
          {activeTab === 'history' && (
            <span className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-blue-500 rounded-t-full shadow-[0_-2px_10px_rgba(59,130,246,0.5)]" />
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'check' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Form Column */}
            <div className="lg:col-span-5 glass-card p-6 border border-gray-700/50">
              <h2 className="text-lg font-semibold text-white mb-6">Input Details</h2>
              <FraudCheckForm onSubmit={handleFraudCheck} isLoading={isLoading} />
            </div>
            
            {/* Result Column */}
            <div className="lg:col-span-7">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm mb-6">
                  {error}
                </div>
              )}
              
              {result ? (
                <AnalysisResult result={result} />
              ) : (
                <div className="h-full min-h-[300px] border border-dashed border-gray-700/50 rounded-2xl flex flex-col items-center justify-center text-gray-500 p-8">
                  <ShieldAlert className="w-12 h-12 mb-4 opacity-20" />
                  <p className="text-center max-w-sm">
                    Enter suspicious details in the form and click "Run Security Check" to analyze for fraud.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* History View */
          <div className="glass-card border border-gray-700/50 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-800/50 border-b border-gray-700/50 text-sm text-gray-400">
                    <th className="p-4 font-medium">Date</th>
                    <th className="p-4 font-medium">Source</th>
                    <th className="p-4 font-medium">Risk Score</th>
                    <th className="p-4 font-medium">Verdict</th>
                    <th className="p-4 font-medium">Scam Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {historyLoading ? (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-gray-500">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                        Loading history...
                      </td>
                    </tr>
                  ) : history.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-gray-500">
                        No previous scans found.
                      </td>
                    </tr>
                  ) : (
                    history.map((item) => (
                      <tr key={item.report_id} className="hover:bg-gray-800/30 transition-colors text-sm text-gray-300">
                        <td className="p-4 whitespace-nowrap">
                          {new Date(item.created_at).toLocaleString()}
                        </td>
                        <td className="p-4 capitalize">{item.source}</td>
                        <td className="p-4">
                          <span className={`font-mono ${item.risk_score >= 60 ? 'text-red-400' : item.risk_score >= 40 ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {item.risk_score}/100
                          </span>
                        </td>
                        <td className="p-4">
                          <VerdictBadge verdict={item.verdict} />
                        </td>
                        <td className="p-4 text-gray-400">
                          {item.scam_type || '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
