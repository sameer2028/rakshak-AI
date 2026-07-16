import { useEffect, useState } from 'react';
import { Users, AlertTriangle, Link as LinkIcon, ChevronRight } from 'lucide-react';
import { fraudNetworkApi } from '../../api/fraud-network.api';

export default function CommunitiesPanel({ onSelectCommunity }) {
  const [communities, setCommunities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const response = await fraudNetworkApi.getCommunities();
        setCommunities(response.data.communities);
      } catch (err) {
        console.error("Failed to load communities", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCommunities();
  }, []);

  if (isLoading) {
    return (
      <div className="glass-card p-4 border border-gray-700/50 flex justify-center py-8">
        <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (communities.length === 0) {
    return null;
  }

  return (
    <div className="glass-card p-4 border border-gray-700/50 space-y-4">
      <h3 className="text-sm font-semibold text-white flex items-center gap-2">
        <Users className="w-4 h-4 text-purple-400" />
        Detected Syndicates
      </h3>

      <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
        {communities.map((comm) => (
          <div 
            key={comm.community_id}
            className="bg-gray-900/40 hover:bg-gray-800/80 border border-gray-700/50 rounded-lg p-3 cursor-pointer transition-colors group"
            onClick={() => onSelectCommunity(comm.community_id)}
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-sm font-bold text-gray-200">
                Community {comm.community_id}
              </h4>
              <span className="text-xs text-gray-500 font-mono">
                {comm.node_count} nodes
              </span>
            </div>

            <div className="space-y-1.5">
              {comm.ring_leaders?.length > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-red-400">
                  <AlertTriangle className="w-3 h-3" />
                  <span className="truncate">Leader: {comm.ring_leaders[0].label}</span>
                </div>
              )}
              {comm.money_mules?.length > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-orange-400">
                  <LinkIcon className="w-3 h-3" />
                  <span className="truncate">{comm.money_mules.length} Money Mule(s)</span>
                </div>
              )}
            </div>

            <div className="mt-3 text-[10px] uppercase tracking-wider text-purple-400 font-bold flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
              View on Graph <ChevronRight className="w-3 h-3 ml-0.5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
