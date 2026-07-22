import { useState, useEffect } from 'react';
import { dashboardApi } from '../../api/dashboard.api';
import { ShieldAlert, AlertTriangle, CheckCircle2, Filter } from 'lucide-react';
import { cn } from '../../lib/utils';
import AlertModal from './AlertModal';
import { useTranslation } from 'react-i18next';

export default function AlertsPage() {
  const { t } = useTranslation();
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, active, resolved
  const [severityFilter, setSeverityFilter] = useState('all'); // all, critical, high, medium, low
  const [selectedAlert, setSelectedAlert] = useState(null);

  const loadAlerts = async () => {
    try {
      setIsLoading(true);
      // We pass limit=100 for the full alerts page
      const res = await dashboardApi.getAlerts(
        severityFilter !== 'all' ? severityFilter : null, 
        filter === 'all' ? null : filter === 'resolved',
        100
      );
      setAlerts(res.data.alerts);
    } catch (err) {
      console.error('Failed to load alerts', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, [filter, severityFilter]);

  const handleResolve = async (id) => {
    try {
      await dashboardApi.resolveAlert(id);
      // Optimistically update
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_resolved: true } : a));
    } catch (err) {
      console.error('Failed to resolve alert', err);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-amber-500" />
            {t('threat_alerts_database')}
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            {t('alerts_subtitle')}
          </p>
        </div>
        
        {/* Filters */}
        <div className="flex gap-2">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 text-white"
          >
            <option value="all">{t('all_status')}</option>
            <option value="active">{t('active_only')}</option>
            <option value="resolved">{t('resolved')}</option>
          </select>

          <select 
            value={severityFilter} 
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 text-white"
          >
            <option value="all">{t('all_severity')}</option>
            <option value="critical">{t('critical')}</option>
            <option value="high">{t('high')}</option>
            <option value="medium">{t('medium')}</option>
            <option value="low">{t('low')}</option>
          </select>
        </div>
      </div>

      <div className="glass-card border border-gray-700/50 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16">
            <ShieldAlert className="w-16 h-16 text-gray-600 mb-4 opacity-50" />
            <h3 className="text-gray-400 font-medium text-lg">{t('no_alerts_found')}</h3>
            <p className="text-gray-500 text-sm mt-2">{t('adjust_filters')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-900/50 text-xs text-gray-500 border-b border-gray-800 uppercase tracking-wider">
                  <th className="p-4 font-medium">{t('time_col')}</th>
                  <th className="p-4 font-medium">{t('severity_col')}</th>
                  <th className="p-4 font-medium">{t('alert_details_col')}</th>
                  <th className="p-4 font-medium">{t('module_col')}</th>
                  <th className="p-4 font-medium text-right">{t('action_col')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {alerts.map((alert) => (
                  <tr 
                    key={alert.id} 
                    onClick={() => setSelectedAlert(alert)}
                    className={cn(
                      "transition-colors group cursor-pointer",
                      alert.is_resolved ? "bg-gray-900/20 opacity-75" : "hover:bg-gray-800/30"
                    )}
                  >
                    <td className="p-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">
                        {new Date(alert.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500 font-mono">
                        {new Date(alert.created_at).toLocaleTimeString()}
                      </div>
                    </td>
                    
                    <td className="p-4 whitespace-nowrap">
                      <span className={cn(
                        "text-[10px] uppercase font-bold px-2 py-0.5 rounded border flex items-center gap-1 w-max",
                        alert.is_resolved ? "bg-gray-800 text-gray-500 border-gray-700" :
                        alert.severity === 'critical' ? 'bg-red-500/20 text-red-400 border-red-500/20' : 
                        alert.severity === 'high' ? 'bg-orange-500/20 text-orange-400 border-orange-500/20' :
                        alert.severity === 'medium' ? 'bg-amber-500/20 text-amber-400 border-amber-500/20' :
                        'bg-blue-500/20 text-blue-400 border-blue-500/20'
                      )}>
                        <AlertTriangle className="w-3 h-3" />
                        {alert.severity}
                      </span>
                    </td>

                    <td className="p-4 min-w-[300px]">
                      <h4 className={cn("text-sm font-semibold mb-1", alert.is_resolved ? "text-gray-400" : "text-gray-200")}>
                        {alert.title}
                      </h4>
                      <p className="text-xs text-gray-400 leading-relaxed max-w-2xl">
                        {alert.description}
                      </p>
                    </td>

                    <td className="p-4 whitespace-nowrap">
                      <span className="text-[10px] uppercase font-bold text-gray-500 bg-black/20 px-2 py-1 rounded">
                        {alert.source_module.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="p-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                      {alert.is_resolved ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 px-3 py-1.5 rounded">
                          <CheckCircle2 className="w-3 h-3" /> {t('resolved')}
                        </span>
                      ) : (
                        <button 
                          onClick={() => handleResolve(alert.id)}
                          className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded transition-colors"
                        >
                          <CheckCircle2 className="w-3 h-3" /> {t('mark_resolved')}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AlertModal 
        alert={selectedAlert} 
        onClose={() => setSelectedAlert(null)} 
        onResolve={handleResolve} 
      />
    </div>
  );
}
