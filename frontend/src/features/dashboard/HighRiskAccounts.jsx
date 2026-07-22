import { ShieldAlert, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function HighRiskAccounts({ accounts }) {
  const { t } = useTranslation();
  if (!accounts || accounts.length === 0) {
    return (
      <div className="glass-card border border-gray-700/50 rounded-xl overflow-hidden p-8 flex flex-col items-center justify-center">
        <ShieldAlert className="w-12 h-12 text-gray-500 mb-4 opacity-50" />
        <h3 className="text-gray-400 font-medium text-lg">No High-Risk Accounts Detected</h3>
        <p className="text-gray-500 text-sm mt-2">The system is currently monitoring for active threats.</p>
      </div>
    );
  }

  return (
    <div className="glass-card border border-gray-700/50 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-gray-700/50 flex justify-between items-center bg-gray-800/20">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-red-400" />
          {t('high_risk_accounts')}
        </h3>
        <button className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
          {t('view_all')} <ArrowRight className="w-3 h-3" />
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-900/50 text-xs text-gray-500 border-b border-gray-800 uppercase tracking-wider">
              <th className="p-3 font-medium">Identifier</th>
              <th className="p-3 font-medium">Type</th>
              <th className="p-3 font-medium">Risk Score</th>
              <th className="p-3 font-medium">Risk Level</th>
              <th className="p-3 font-medium text-right">Fraud Connections</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {accounts.map((acc, idx) => {
              const riskLevel = acc.risk_score >= 85 ? 'critical' : acc.risk_score >= 60 ? 'high' : 'medium';
              return (
                <tr key={acc.account_id || idx} className="hover:bg-gray-800/30 transition-colors group text-sm">
                  <td className="p-3 font-mono text-gray-300">{acc.identifier}</td>
                  <td className="p-3 text-gray-400 capitalize">{acc.account_type.replace('_', ' ')}</td>
                  <td className="p-3 font-mono text-gray-300">{acc.risk_score}/100</td>
                  <td className="p-3">
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                      riskLevel === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/20' : 
                      riskLevel === 'high' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/20' :
                      'bg-amber-500/20 text-amber-400 border border-amber-500/20'
                    }`}>
                      {riskLevel}
                    </span>
                  </td>
                  <td className="p-3 text-right font-mono text-gray-300">
                    {acc.fraud_count} links
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
