import { Network, Link } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export default function FraudRingSummary({ data }) {
  const communities = data?.top_communities || [];

  return (
    <div className="glass-card h-full border border-gray-700/50 flex flex-col">
      <div className="p-4 border-b border-gray-700/50 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Network className="w-4 h-4 text-purple-400" />
          Top Fraud Rings Detected
        </h3>
        <NavLink to="/fraud-network" className="w-4 h-4 text-gray-400 hover:text-white cursor-pointer group">
          <Link className="w-4 h-4 transition-transform group-hover:scale-110" />
        </NavLink>
      </div>

      <div className="p-4 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
        {communities.length === 0 ? (
           <div className="text-sm text-gray-500 text-center py-8">
             No active fraud rings detected in the network.
           </div>
        ) : (
          communities.map((ring, idx) => (
            <div key={ring.id || idx} className="bg-gray-900/50 border border-gray-800 rounded-lg p-3 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-mono text-xs text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 shadow-sm">
                    Ring {ring.id}
                  </span>
                  <span className={`text-xs font-bold ${ring.risk >= 85 ? 'text-red-400' : 'text-orange-400'}`}>
                    Avg Risk: {ring.risk}
                  </span>
                </div>
                
                <div className="flex justify-between items-end text-sm mt-3">
                  <div>
                    <p className="text-gray-400 text-[10px] uppercase tracking-wider mb-0.5">Primary Activity</p>
                    <p className="text-gray-200 font-medium">{ring.main_type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-[10px] uppercase tracking-wider mb-0.5">Members</p>
                    <p className="text-gray-200 font-mono font-medium">{ring.nodes}</p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
