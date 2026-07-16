import { Cpu, Search, Loader2, Filter, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../lib/utils';

const NODE_TYPES = [
  { id: '', label: 'All Types' },
  { id: 'suspect', label: 'Suspect' },
  { id: 'victim', label: 'Victim' },
  { id: 'phone', label: 'Phone' },
  { id: 'upi', label: 'UPI' },
  { id: 'bank_account', label: 'Bank Account' },
];

export default function GraphControls({ 
  onAnalyze, 
  onSearch, 
  isLoading,
  onFilterChange,
  activeFilters,
  communitiesCount = 0
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleCommunityChange = (e) => {
    const val = e.target.value;
    onFilterChange({ ...activeFilters, communityId: val === '' ? null : Number(val) });
  };

  const handleTypeChange = (typeId) => {
    onFilterChange({ ...activeFilters, nodeType: typeId === '' ? null : typeId });
  };

  return (
    <div className="space-y-4">
      {/* Algorithms */}
      <div className="glass-card p-4 border border-gray-700/50">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-purple-400" />
          Graph Intelligence Algorithms
        </h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onAnalyze('louvain')}
            disabled={isLoading}
            className="px-3 py-1.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30 text-xs font-medium hover:bg-purple-500/20 transition-all disabled:opacity-50"
          >
            Detect Communities (Louvain)
          </button>
          <button
            onClick={() => onAnalyze('pagerank')}
            disabled={isLoading}
            className="px-3 py-1.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30 text-xs font-medium hover:bg-blue-500/20 transition-all disabled:opacity-50"
          >
            Find Ring Leaders (PageRank)
          </button>
          <button
            onClick={() => onAnalyze('centrality')}
            disabled={isLoading}
            className="px-3 py-1.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/30 text-xs font-medium hover:bg-orange-500/20 transition-all disabled:opacity-50"
          >
            Find Money Mules (Centrality)
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 border border-gray-700/50">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Filter className="w-4 h-4 text-green-400" />
          Graph Filters
        </h3>
        
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Community / Syndicate</label>
            <select
              value={activeFilters.communityId === null ? '' : activeFilters.communityId}
              onChange={handleCommunityChange}
              disabled={isLoading}
              className="w-full bg-gray-900/50 border border-gray-700 rounded-lg text-sm text-gray-300 py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value="">All Communities</option>
              {Array.from({ length: communitiesCount }).map((_, i) => (
                <option key={i} value={i}>Community {i}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Node Type</label>
            <div className="flex flex-wrap gap-1.5">
              {NODE_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleTypeChange(type.id)}
                  disabled={isLoading}
                  className={cn(
                    "px-2.5 py-1 rounded-md text-[10px] font-medium uppercase tracking-wider transition-all border",
                    (activeFilters.nodeType === type.id) || (activeFilters.nodeType === null && type.id === '')
                      ? "bg-green-500/20 text-green-400 border-green-500/40"
                      : "bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700"
                  )}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="glass-card p-4 border border-gray-700/50 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 -translate-y-1/2 left-3 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search phone, UPI..."
            className="w-full pl-9 pr-3 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-sm text-gray-300 focus:ring-1 focus:ring-purple-500 outline-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSearch(searchQuery);
            }}
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                onSearch('');
              }}
              className="absolute top-1/2 -translate-y-1/2 right-3 p-1 rounded-full hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
              title="Clear Search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
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
