import { X, Network, AlertTriangle, Link as LinkIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function NodeDetail({ node, onClose }) {
  if (!node) return null;

  return (
    <div className="absolute top-4 right-4 w-80 glass-card border border-gray-700 shadow-2xl rounded-xl overflow-hidden animate-slide-left z-10">
      <div className="p-4 border-b border-gray-700 flex justify-between items-start bg-gray-800/50">
        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-gray-500">
            {node.node_type}
          </span>
          <h3 className="text-lg font-bold text-white mt-0.5">{node.label}</h3>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded-md text-gray-400">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {node.is_flagged && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex gap-3 items-start">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-400">Flagged Entity</p>
              <p className="text-xs text-red-300 mt-0.5">High risk of fraud association.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800">
            <p className="text-xs text-gray-500 mb-1">PageRank</p>
            <p className="text-sm font-mono text-gray-300">{(node.pagerank || 0).toFixed(4)}</p>
          </div>
          <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800">
            <p className="text-xs text-gray-500 mb-1">Centrality</p>
            <p className="text-sm font-mono text-gray-300">{(node.centrality || 0).toFixed(4)}</p>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Network className="w-3 h-3" /> Community
          </h4>
          <span className="px-2.5 py-1 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded text-xs font-medium">
            Cluster {node.community || 'Unknown'}
          </span>
        </div>

        {node.is_ring_leader && (
          <div className="px-3 py-2 bg-orange-500/10 border border-orange-500/30 rounded text-orange-400 text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Suspected Ring Leader
          </div>
        )}
        
        {node.is_money_mule && (
          <div className="px-3 py-2 bg-blue-500/10 border border-blue-500/30 rounded text-blue-400 text-sm flex items-center gap-2">
            <LinkIcon className="w-4 h-4" /> Suspected Money Mule
          </div>
        )}
      </div>
    </div>
  );
}
