import { ShieldAlert, AlertTriangle, CheckCircle2, X, MapPin, Tag, Activity } from 'lucide-react';
import { cn } from '../../lib/utils';
import { dashboardApi } from '../../api/dashboard.api';
import { createPortal } from 'react-dom';
import { useState, useEffect } from 'react';

export default function AlertModal({ alert, onClose, onResolve }) {
  const [evidence, setEvidence] = useState(null);
  const [isLoadingEvidence, setIsLoadingEvidence] = useState(false);
  const [resolveError, setResolveError] = useState(null);

  useEffect(() => {
    if (alert?.id) {
      setIsLoadingEvidence(true);
      dashboardApi.getAlertEvidence(alert.id)
        .then(res => setEvidence(res.data))
        .catch(err => console.error("Failed to fetch evidence", err))
        .finally(() => setIsLoadingEvidence(false));
    }
  }, [alert]);
  if (!alert) return null;

  const handleResolve = async () => {
    try {
      setResolveError(null);
      await dashboardApi.resolveAlert(alert.id);
      if (onResolve) onResolve(alert.id);
      if (onClose) onClose();
    } catch (err) {
      console.error(err);
      setResolveError(err.response?.data?.detail || err.message || "Failed to resolve alert");
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div 
        className={cn(
          "bg-gray-900 border rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl transition-all",
          alert.severity === 'critical' ? 'border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.15)]' :
          alert.severity === 'high' ? 'border-orange-500/50' :
          alert.severity === 'medium' ? 'border-amber-500/50' : 'border-blue-500/50'
        )}
      >
        <div className="flex justify-between items-start p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-3 rounded-lg flex-shrink-0",
              alert.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
              alert.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
              alert.severity === 'medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'
            )}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{alert.title}</h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-gray-400 font-mono">
                  {new Date(alert.created_at).toLocaleString()}
                </span>
                <span className="text-[10px] uppercase font-bold text-gray-500 bg-gray-800 px-2 py-0.5 rounded">
                  {alert.source_module.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Description</h4>
            <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">
              {alert.description}
            </p>
          </div>

          <div className="bg-gray-900/80 rounded-xl p-4 border border-gray-700/80 shadow-inner">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Activity className="w-3 h-3" />
              Original Evidence / Transcript
            </h4>
            {isLoadingEvidence ? (
              <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-500"></div>
                Loading evidence...
              </div>
            ) : evidence ? (
              <div className="bg-black/40 p-3 rounded-lg border border-gray-800/50 max-h-[250px] overflow-y-auto custom-scrollbar">
                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap font-mono">
                  {evidence.evidence_text}
                </p>
              </div>
            ) : (
              <p className="text-gray-500 text-sm italic">No raw evidence found.</p>
            )}
          </div>

          {(alert.state || alert.district || alert.reference_id || Object.keys(alert.metadata || {}).length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(alert.state || alert.district) && (
                <div className="flex items-start gap-3 bg-gray-800/30 p-4 rounded-lg border border-gray-700/50">
                  <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Location</p>
                    <p className="text-sm text-gray-300">
                      {[alert.district, alert.state].filter(Boolean).join(', ')}
                    </p>
                  </div>
                </div>
              )}

              {alert.reference_id && (
                <div className="flex items-start gap-3 bg-gray-800/30 p-4 rounded-lg border border-gray-700/50">
                  <Tag className="w-4 h-4 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Reference ID</p>
                    <p className="text-sm text-gray-300 font-mono">{alert.reference_id}</p>
                  </div>
                </div>
              )}

              {alert.metadata && Object.keys(alert.metadata).length > 0 && (
                <div className="md:col-span-2 flex items-start gap-3 bg-gray-800/30 p-4 rounded-lg border border-gray-700/50">
                  <Activity className="w-4 h-4 text-gray-500 mt-0.5" />
                  <div className="w-full">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Metadata</p>
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                      {Object.entries(alert.metadata).map(([k, v]) => (
                        <div key={k} className="flex gap-2">
                          <span className="text-gray-500 capitalize">{k.replace('_', ' ')}:</span>
                          <span className="text-gray-300 font-mono truncate">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-800 flex justify-end gap-3 bg-gray-900/50">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            Close
          </button>
          
          {!alert.is_resolved ? (
            <div className="flex items-center gap-3">
              {resolveError && (
                <span className="text-red-400 text-sm">{resolveError}</span>
              )}
              <button 
                onClick={handleResolve}
                className="px-4 py-2 flex items-center gap-2 text-sm font-medium text-emerald-400 hover:text-white bg-emerald-500/10 hover:bg-emerald-500 border border-emerald-500/30 hover:border-emerald-500 rounded-lg transition-all"
              >
                <CheckCircle2 className="w-4 h-4" /> Mark as Resolved
              </button>
            </div>
          ) : (
            <span className="px-4 py-2 flex items-center gap-2 text-sm font-medium text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 rounded-lg opacity-80">
              <CheckCircle2 className="w-4 h-4" /> Resolved
            </span>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
