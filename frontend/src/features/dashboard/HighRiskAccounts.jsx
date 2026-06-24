import { ShieldAlert, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

export default function HighRiskAccounts({ accounts }) {
  // Using dummy data if accounts array is empty/undefined
  const displayData = accounts?.length ? accounts : [
    { account: 'XXXX-4392', bank: 'SBI', risk_level: 'critical', total_amount: 1450000 },
    { account: 'XXXX-9104', bank: 'HDFC', risk_level: 'critical', total_amount: 890000 },
    { account: 'XXXX-2231', bank: 'ICICI', risk_level: 'high', total_amount: 450000 },
    { account: 'XXXX-5589', bank: 'Axis', risk_level: 'high', total_amount: 320000 },
  ];

  return (
    <div className="glass-card border border-gray-700/50 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-gray-700/50 flex justify-between items-center bg-gray-800/20">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-red-400" />
          High-Risk Accounts to Freeze
        </h3>
        <button className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
          View All <ArrowRight className="w-3 h-3" />
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-900/50 text-xs text-gray-500 border-b border-gray-800 uppercase tracking-wider">
              <th className="p-3 font-medium">Account</th>
              <th className="p-3 font-medium">Bank</th>
              <th className="p-3 font-medium">Risk</th>
              <th className="p-3 font-medium text-right">Suspected Amt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {displayData.map((acc, idx) => (
              <tr key={idx} className="hover:bg-gray-800/30 transition-colors group text-sm">
                <td className="p-3 font-mono text-gray-300">{acc.account}</td>
                <td className="p-3 text-gray-400">{acc.bank}</td>
                <td className="p-3">
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                    acc.risk_level === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/20' : 'bg-orange-500/20 text-orange-400 border border-orange-500/20'
                  }`}>
                    {acc.risk_level}
                  </span>
                </td>
                <td className="p-3 text-right font-mono text-gray-300">
                  {formatCurrency(acc.total_amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
