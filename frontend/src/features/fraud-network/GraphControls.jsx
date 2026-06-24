import { Activity, ShieldAlert, Cpu, Search, Loader2 } from 'lucide-react';
import { useState } from 'react';

export default function GraphControls({ onAnalyze, onSearch, isLoading }) {
  const [searchQuery, setSearchQuery] = useState('');
  
  const handleAnalyze = (algorithm) => {
    onAnalyze(algorithm);
  };

  return (
    <div className="space-y-4">
      <div className="glass-card p-4 border border-gray-700/50">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-purple-400" />
          Graph Intelligence Algorithms
        </h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleAnalyze('louvain')}
            disabled={isLoading}
            className="px-3 py-1.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30 text-xs font-medium hover:bg-purple-500/20 transition-all disabled:opacity-50"
          >
            Detect Communities (Louvain)
          </button>
          <button
            onClick={() => handleAnalyze('pagerank')}
            disabled={isLoading}
            className="px-3 py-1.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30 text-xs font-medium hover:bg-blue-500/20 transition-all disabled:opacity-50"
          >
            Find Ring Leaders (PageRank)
          </button>
          <button
            onClick={() => handleAnalyze('centrality')}
            disabled={isLoading}
            className="px-3 py-1.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/30 text-xs font-medium hover:bg-orange-500/20 transition-all disabled:opacity-50"
          >
            Find Money Mules (Centrality)
          </button>
        </div>
      </div>

      <div className="glass-card p-4 border border-gray-700/50 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 -translate-y-1/2 left-3 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search phone, UPI, or account..."
            className="w-full pl-9 pr-3 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-sm text-gray-300 focus:ring-1 focus:ring-purple-500 outline-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSearch(searchQuery);
            }}
          />
        </div>
        <button 
          onClick={() => onSearch(searchQuery)}
          className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-700 border border-gray-600 transition-all"
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
        </button>
      </div>
    </div>
  );
}
