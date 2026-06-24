import { AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function DistrictRiskPanel({ districts, isLoading }) {
  if (isLoading) {
    return (
      <div className="glass-card h-full border border-gray-700/50 p-4 animate-pulse flex flex-col">
        <div className="h-6 w-32 bg-gray-800 rounded mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-16 bg-gray-800/50 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card h-full border border-gray-700/50 flex flex-col">
      <div className="p-4 border-b border-gray-700/50 flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-red-400" />
        <h3 className="text-sm font-semibold text-white">High Risk Districts</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {districts?.length === 0 ? (
          <div className="text-sm text-gray-500 text-center py-8">
            No high-risk districts found for the selected filters.
          </div>
        ) : (
          districts?.map((district, idx) => (
            <div 
              key={idx} 
              className="bg-gray-800/40 border border-gray-700/50 rounded-lg p-3 hover:bg-gray-800/60 transition-colors cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-1">
                <h4 className="text-sm font-semibold text-gray-200 group-hover:text-blue-400 transition-colors">
                  {district.district}
                </h4>
                <span className={cn(
                  "text-[10px] uppercase font-bold px-2 py-0.5 rounded",
                  district.risk_level === 'critical' ? 'bg-red-500/20 text-red-400' :
                  district.risk_level === 'high' ? 'bg-orange-500/20 text-orange-400' :
                  'bg-amber-500/20 text-amber-400'
                )}>
                  {district.risk_level}
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-2">{district.state}</p>
              
              <div className="flex justify-between text-xs text-gray-400">
                <span className="font-mono">Cases: {district.fraud_count}</span>
                <span className="font-mono">Score: {district.risk_score}</span>
              </div>
              
              <div className="w-full bg-gray-900 rounded-full h-1.5 mt-2 overflow-hidden">
                <div 
                  className={cn(
                    "h-1.5 rounded-full",
                    district.risk_level === 'critical' ? 'bg-red-500' :
                    district.risk_level === 'high' ? 'bg-orange-500' : 'bg-amber-500'
                  )}
                  style={{ width: `${district.risk_score}%` }}
                ></div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
