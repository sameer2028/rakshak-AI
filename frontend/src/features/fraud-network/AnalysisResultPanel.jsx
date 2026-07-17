import { useState, useEffect } from 'react';
import { X, Zap, Users, Crown, Banknote, Clock, CheckCircle2, TrendingUp } from 'lucide-react';
import { cn } from '../../lib/utils';

const ALGO_CONFIG = {
  louvain: {
    label: 'Community Detection (Louvain)',
    icon: Users,
    gradient: 'from-purple-500 to-indigo-600',
    glow: 'shadow-[0_0_30px_rgba(139,92,246,0.3)]',
    border: 'border-purple-500/40',
    bg: 'bg-purple-500/10',
    text: 'text-purple-300',
    accent: 'text-purple-400',
  },
  pagerank: {
    label: 'Ring Leader Detection (PageRank)',
    icon: Crown,
    gradient: 'from-blue-500 to-cyan-500',
    glow: 'shadow-[0_0_30px_rgba(59,130,246,0.3)]',
    border: 'border-blue-500/40',
    bg: 'bg-blue-500/10',
    text: 'text-blue-300',
    accent: 'text-blue-400',
  },
  centrality: {
    label: 'Money Mule Detection (Centrality)',
    icon: Banknote,
    gradient: 'from-orange-500 to-amber-500',
    glow: 'shadow-[0_0_30px_rgba(249,115,22,0.3)]',
    border: 'border-orange-500/40',
    bg: 'bg-orange-500/10',
    text: 'text-orange-300',
    accent: 'text-orange-400',
  },
};

function AnimatedCounter({ value, duration = 1200 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (value === 0) { setCount(0); return; }
    let start = 0;
    const step = Math.max(1, Math.floor(value / (duration / 30)));
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setCount(value); clearInterval(timer); }
      else setCount(start);
    }, 30);
    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{count}</span>;
}

export default function AnalysisResultPanel({ result, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => setVisible(true));
  }, []);

  if (!result) return null;

  const config = ALGO_CONFIG[result.algorithm] || ALGO_CONFIG.louvain;
  const Icon = config.icon;
  const message = result.results?.message || 'Analysis complete.';

  // Parse key numbers from the message
  const numberMatches = message.match(/\d+/g) || [];
  const primaryNumber = numberMatches[0] ? parseInt(numberMatches[0]) : result.updated_nodes;

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div
      className={cn(
        'absolute top-4 left-1/2 -translate-x-1/2 z-30 w-[90%] max-w-lg transition-all duration-300',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6'
      )}
    >
      <div className={cn(
        'rounded-xl border backdrop-blur-xl overflow-hidden',
        config.border,
        config.glow,
        'bg-gray-900/95'
      )}>
        {/* Top gradient bar */}
        <div className={cn('h-1 bg-gradient-to-r', config.gradient)} />

        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center',
                config.bg
              )}>
                <Icon className={cn('w-5 h-5', config.accent)} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">{config.label}</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span className="text-[11px] text-emerald-400 font-medium">Completed Successfully</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-1 rounded-md text-gray-500 hover:text-white hover:bg-gray-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className={cn('rounded-lg p-3 text-center border', config.border, config.bg)}>
              <div className={cn('text-2xl font-black tabular-nums', config.accent)}>
                <AnimatedCounter value={primaryNumber} />
              </div>
              <div className="text-[10px] text-gray-400 uppercase tracking-wider mt-1 font-semibold">
                {result.algorithm === 'louvain' ? 'Nodes Updated' :
                 result.algorithm === 'pagerank' ? 'Leaders Found' : 'Mules Found'}
              </div>
            </div>

            <div className="rounded-lg p-3 text-center border border-gray-700/50 bg-gray-800/30">
              <div className="text-2xl font-black text-white tabular-nums">
                <AnimatedCounter value={result.updated_nodes} />
              </div>
              <div className="text-[10px] text-gray-400 uppercase tracking-wider mt-1 font-semibold">
                Nodes Analyzed
              </div>
            </div>

            <div className="rounded-lg p-3 text-center border border-gray-700/50 bg-gray-800/30">
              <div className="text-2xl font-black text-white tabular-nums flex items-center justify-center gap-1">
                <AnimatedCounter value={Math.round(result.execution_time_ms / 1000 * 10) / 10 * 10} />
                <span className="text-xs text-gray-500 font-normal">ms</span>
              </div>
              <div className="text-[10px] text-gray-400 uppercase tracking-wider mt-1 font-semibold">
                Exec Time
              </div>
            </div>
          </div>

          {/* Result Message */}
          <div className="flex items-start gap-2 bg-gray-800/50 rounded-lg p-3 border border-gray-700/30">
            <TrendingUp className={cn('w-4 h-4 mt-0.5 shrink-0', config.accent)} />
            <p className="text-xs text-gray-300 leading-relaxed">
              {message}
              {' '}The graph visualization has been refreshed with updated metrics.
            </p>
          </div>

          {/* Detected Entities List */}
          {result.results?.entities?.length > 0 && (
            <div className="mt-4">
              <h4 className={cn('text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-2', config.accent)}>
                <Icon className="w-3.5 h-3.5" />
                {result.algorithm === 'pagerank' ? 'Identified Ring Leaders' : 'Suspected Money Mules'}
              </h4>
              <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                {result.results.entities.map((entity, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      'flex items-center justify-between p-2 rounded-lg border transition-all',
                      config.border, config.bg
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={cn(
                        'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0',
                        'bg-gradient-to-br', config.gradient, 'text-white'
                      )}>
                        {idx + 1}
                      </span>
                      <span className="text-sm text-white font-medium truncate">{entity.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={cn('h-full rounded-full bg-gradient-to-r', config.gradient)}
                          style={{ width: `${Math.min(100, entity.score * 1000)}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-gray-400 font-mono w-12 text-right">
                        {entity.score.toFixed(4)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Community Breakdown for Louvain */}
          {result.results?.communities?.length > 0 && (
            <div className="mt-4">
              <h4 className={cn('text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-2', config.accent)}>
                <Users className="w-3.5 h-3.5" />
                Detected Fraud Syndicates
              </h4>
              <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                {result.results.communities.map((comm) => (
                  <div
                    key={comm.id}
                    className={cn(
                      'p-2.5 rounded-lg border transition-all',
                      config.border, config.bg
                    )}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={cn('text-xs font-bold', config.accent)}>
                        Syndicate #{comm.id}
                      </span>
                      <span className="text-[10px] text-gray-400 bg-gray-800 px-1.5 py-0.5 rounded">
                        {comm.size} members
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {comm.members.map((name, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800/80 text-gray-300 border border-gray-700/50"
                        >
                          {name}
                        </span>
                      ))}
                      {comm.size > comm.members.length && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800/50 text-gray-500 italic">
                          +{comm.size - comm.members.length} more
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
