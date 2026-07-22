import { X, Network, AlertTriangle, Link as LinkIcon, Smartphone, CreditCard, Landmark, User, Skull } from 'lucide-react';
import { cn } from '../../lib/utils';
import RiskMeter from '../../components/common/RiskMeter';
import { useTranslation } from 'react-i18next';

const PropertyRow = ({ label, value }) => (
  <div className="flex justify-between text-sm py-1.5 border-b border-gray-800/50 last:border-0">
    <span className="text-gray-500 font-medium">{label}</span>
    <span className="text-gray-300 font-mono text-right">{value}</span>
  </div>
);

export default function NodeDetail({ node, onClose }) {
  const { t } = useTranslation();
  if (!node) return null;

  const { metrics = {}, properties = {}, connected_nodes = [], connected_edges = [] } = node;
  const isRingLeader = metrics.is_ring_leader;
  const isMoneyMule = metrics.is_money_mule;

  const getNodeIcon = (type) => {
    switch (type) {
      case 'suspect': return <Skull className="w-5 h-5 text-red-400" />;
      case 'victim': return <User className="w-5 h-5 text-blue-400" />;
      case 'phone': return <Smartphone className="w-5 h-5 text-gray-400" />;
      case 'upi': return <CreditCard className="w-5 h-5 text-purple-400" />;
      case 'bank_account': return <Landmark className="w-5 h-5 text-green-400" />;
      default: return <Network className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="absolute top-4 right-4 w-96 max-h-[calc(100%-2rem)] flex flex-col glass-card border border-gray-700 shadow-2xl rounded-xl overflow-hidden animate-slide-left z-10">
      <div className="p-4 border-b border-gray-700 flex justify-between items-start bg-gray-800/80 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-start gap-3">
          <div className="mt-1 bg-gray-900 p-2 rounded-lg border border-gray-700">
            {getNodeIcon(node.node_type)}
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-gray-500">
              {node.node_type.replace('_', ' ')}
            </span>
            <h3 className="text-lg font-bold text-white leading-tight mt-0.5">{node.label}</h3>
            {metrics.community_id != null && (
              <span className="inline-block mt-2 px-2 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded text-[10px] font-medium uppercase tracking-wider">
                {t('cluster')} {metrics.community_id}
              </span>
            )}
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-gray-700 rounded-md text-gray-400 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-5 overflow-y-auto custom-scrollbar">
        {/* Risk & Badges */}
        <div className="flex gap-4 items-center">
          <div className="flex-shrink-0">
            <RiskMeter score={metrics.risk_score || 0} size={70} strokeWidth={6} />
          </div>
          <div className="flex-1 space-y-2">
            {isRingLeader && (
              <div className="px-2.5 py-1.5 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-xs font-medium flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5" /> {t('suspected_ring_leader')}
              </div>
            )}
            {isMoneyMule && (
              <div className="px-2.5 py-1.5 bg-orange-500/10 border border-orange-500/30 rounded text-orange-400 text-xs font-medium flex items-center gap-2">
                <LinkIcon className="w-3.5 h-3.5" /> {t('suspected_money_mule')}
              </div>
            )}
            {node.is_flagged && !isRingLeader && !isMoneyMule && (
              <div className="px-2.5 py-1.5 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-xs font-medium flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5" /> {t('flagged_entity')}
              </div>
            )}
          </div>
        </div>

        {/* Properties */}
        {Object.keys(properties).length > 0 && (
          <div className="bg-gray-900/50 rounded-lg border border-gray-800 p-3">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{t('properties')}</h4>
            <div className="space-y-1">
              {Object.entries(properties).map(([key, val]) => (
                <PropertyRow key={key} label={key.replace(/_/g, ' ')} value={val?.toString()} />
              ))}
            </div>
          </div>
        )}

        {/* Graph Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800">
            <p className="text-xs text-gray-500 mb-1">{t('pagerank')}</p>
            <p className="text-sm font-mono text-gray-300">{(metrics.pagerank || 0).toFixed(4)}</p>
          </div>
          <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800">
            <p className="text-xs text-gray-500 mb-1">{t('centrality')}</p>
            <p className="text-sm font-mono text-gray-300">{(metrics.centrality || 0).toFixed(4)}</p>
          </div>
        </div>

        {/* Connected Nodes Summary */}
        {connected_nodes.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Network className="w-3 h-3" /> {t('connections')} ({connected_nodes.length})
            </h4>
            <div className="space-y-2">
              {connected_nodes.slice(0, 10).map((cnode) => (
                <div key={cnode.node_id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-800/30 border border-gray-700/50">
                  <div className="p-1.5 bg-gray-900 rounded border border-gray-700">
                    {getNodeIcon(cnode.node_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-200 truncate">{cnode.label}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">{cnode.node_type}</p>
                  </div>
                </div>
              ))}
              {connected_nodes.length > 10 && (
                <p className="text-xs text-center text-gray-500 pt-2">
                  + {connected_nodes.length - 10} {t('more_connections')}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
