import { ShieldAlert, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { dashboardApi } from '../../api/dashboard.api';
import AlertModal from './AlertModal';
import { useState } from 'react';

export default function LiveAlertsFeed({ alerts, onResolve }) {
  const [selectedAlert, setSelectedAlert] = useState(null);
  
  const handleResolve = async (id) => {
    try {
      await dashboardApi.resolveAlert(id);
      onResolve(id);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="glass-card flex flex-col h-full border border-gray-700/50">
      <div className="p-4 border-b border-gray-700/50 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-500" />
          Live Threat Alerts
        </h3>
        <span className="bg-red-500/20 text-red-400 text-xs px-2 py-0.5 rounded-full font-bold">
          {alerts?.filter(a => !a.is_resolved).length || 0} Active
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {(!alerts || alerts.length === 0) ? (
          <div className="text-sm text-gray-500 text-center py-8">
            No active alerts in the system.
          </div>
        ) : (
          alerts.map((alert) => (
            <div 
              key={alert.id} 
              onClick={() => setSelectedAlert(alert)}
              className={cn(
                "p-3 rounded-lg border flex gap-3 transition-all cursor-pointer",
                alert.is_resolved 
                  ? "bg-gray-800/30 border-gray-700/50 opacity-60" 
                  : alert.severity === 'critical' ? "bg-red-500/10 border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.1)]"
                  : alert.severity === 'high' ? "bg-orange-500/10 border-orange-500/30"
                  : "bg-amber-500/10 border-amber-500/30"
              )}
            >
              <AlertTriangle className={cn(
                "w-5 h-5 flex-shrink-0",
                alert.is_resolved ? "text-gray-500" 
                : alert.severity === 'critical' ? "text-red-400"
                : alert.severity === 'high' ? "text-orange-400" : "text-amber-400"
              )} />
              
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h4 className={cn("text-sm font-semibold", alert.is_resolved ? "text-gray-400" : "text-gray-200")}>
                    {alert.title}
                  </h4>
                  <span className="text-[10px] text-gray-500 font-mono">
                    {new Date(alert.created_at).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mb-2 leading-relaxed">{alert.description}</p>
                
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-gray-500 bg-black/20 px-2 py-0.5 rounded">
                    {alert.source_module.replace('_', ' ')}
                  </span>
                  
                  {!alert.is_resolved && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleResolve(alert.id); }}
                      className="flex items-center gap-1 text-xs font-medium text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-1 rounded transition-colors"
                    >
                      <CheckCircle2 className="w-3 h-3" /> Resolve
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <AlertModal 
        alert={selectedAlert} 
        onClose={() => setSelectedAlert(null)} 
        onResolve={(id) => {
           // Wait for the Dashboard API call inside AlertModal to complete, 
           // but we also need to trigger the parent onResolve here
           onResolve(id);
        }} 
      />
    </div>
  );
}
