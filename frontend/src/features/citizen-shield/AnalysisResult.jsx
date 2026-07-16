import RiskMeter from '../../components/common/RiskMeter';
import VerdictBadge from '../../components/common/VerdictBadge';
import { Activity, ShieldAlert, CheckCircle2, AlertTriangle, ChevronRight } from 'lucide-react';
import { getRiskBgColor, cn } from '../../lib/utils';
import { TRANSLATIONS } from '../../constants/translations';

export default function AnalysisResult({ result, language = 'en' }) {
  if (!result) return null;

  const { verdict, risk_score, confidence, reasons, matched_patterns, response_time_ms } = result;

  // Determine color theme based on verdict
  const theme = {
    SCAM: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', icon: ShieldAlert },
    SUSPICIOUS: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', icon: AlertTriangle },
    SAFE: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', icon: CheckCircle2 },
  }[verdict] || { bg: 'bg-gray-500/10', border: 'border-gray-500/30', text: 'text-gray-400', icon: Activity };

  const HeaderIcon = theme.icon;

  return (
    <div className="animate-fade-in space-y-6">
      {/* Overview Card */}
      <div className={cn("rounded-2xl border p-6 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden", theme.bg, theme.border)}>
        {/* Glow effect */}
        <div className={cn("absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[80px] opacity-30", theme.bg)} />

        <div className="flex-shrink-0 relative z-10">
          <RiskMeter score={risk_score} size={140} strokeWidth={12} />
        </div>

        <div className="flex-1 text-center md:text-left relative z-10">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
            <HeaderIcon className={cn("w-6 h-6", theme.text)} />
            <h3 className="text-xl font-bold text-white tracking-wide">Analysis Complete</h3>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-3 mt-4">
            <span className="text-gray-400 text-sm">Verdict:</span>
            <span className={cn("px-4 py-1.5 rounded-full text-sm font-semibold border", theme.bg, theme.border, theme.text)}>
              {TRANSLATIONS[language]?.verdict[verdict] || verdict}
            </span>
          </div>

          <div className="mt-6 flex flex-wrap gap-4 text-xs font-mono text-gray-400 justify-center md:justify-start">
            <div className="bg-black/30 px-3 py-1.5 rounded-lg border border-white/5">
              Confidence: <span className="text-white">{(confidence * 100).toFixed(1)}%</span>
            </div>
            <div className="bg-black/30 px-3 py-1.5 rounded-lg border border-white/5">
              Response Time: <span className="text-white">{response_time_ms}ms</span>
            </div>
          </div>
        </div>
      </div>

      {/* Fraud Network Link Status */}
      {result.fraud_network_match ? (
        result.fraud_network_match.matched ? (
          <div className="rounded-2xl border border-red-500/50 bg-red-950/20 p-5 flex items-start gap-4 shadow-glow-red relative overflow-hidden">
            <div className="absolute -top-10 -left-10 w-24 h-24 rounded-full blur-[40px] bg-red-500 opacity-20" />
            <ShieldAlert className="w-7 h-7 text-red-500 flex-shrink-0 mt-0.5 animate-pulse relative z-10" />
            <div className="relative z-10">
              <h4 className="text-base font-bold text-red-400 tracking-wide">Verified Cybercrime Link Detected</h4>
              <p className="text-sm text-gray-200 mt-1.5 leading-relaxed">
                The reported <strong className="capitalize">{result.fraud_network_match.entity_type}</strong> (<code className="text-red-300 font-mono bg-red-950/40 px-1.5 py-0.5 rounded border border-red-500/20">{result.fraud_network_match.entity_value}</code>) was found inside the intelligence database and is directly linked to the <strong className="text-white bg-red-500/20 px-2 py-0.5 rounded border border-red-500/30">{result.fraud_network_match.community_name}</strong>.
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/10 p-5 flex items-start gap-4 relative overflow-hidden">
            <CheckCircle2 className="w-7 h-7 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-base font-semibold text-emerald-400 tracking-wide">Fraud Network Grid Check</h4>
              <p className="text-sm text-gray-300 mt-1.5 leading-relaxed">
                No matching record found in active command center Fraud Networks.
              </p>
            </div>
          </div>
        )
      ) : (
        <div className="rounded-2xl border border-gray-800 bg-gray-900/10 p-5 flex items-start gap-4">
          <Activity className="w-7 h-7 text-gray-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-base font-semibold text-gray-400 tracking-wide">Fraud Network Grid Check</h4>
            <p className="text-sm text-gray-400 mt-1.5 leading-relaxed">
              No matching record found in active command center Fraud Networks.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Reasons Panel */}
        <div className="glass-card p-5 border border-gray-700/50">
          <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-gray-400" />
            Detection Factors
          </h4>
          <ul className="space-y-3">
            {reasons?.map((reason, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm text-gray-300 bg-gray-800/30 p-3 rounded-lg border border-gray-700/30">
                <ChevronRight className={cn("w-4 h-4 mt-0.5 flex-shrink-0", theme.text)} />
                <span>{reason}</span>
              </li>
            ))}
            {(!reasons || reasons.length === 0) && (
              <li className="text-sm text-gray-500 italic">No specific factors identified.</li>
            )}
          </ul>
        </div>

        {/* Extracted Patterns */}
        <div className="glass-card p-5 border border-gray-700/50">
          <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-gray-400" />
            Matched Patterns
          </h4>
          <div className="flex flex-wrap gap-2">
            {matched_patterns?.map((pattern, idx) => (
              <span key={idx} className="px-3 py-1.5 rounded-lg bg-gray-800/60 border border-gray-700 text-xs font-mono text-cyan-300 shadow-sm">
                {pattern}
              </span>
            ))}
            {(!matched_patterns || matched_patterns.length === 0) && (
              <span className="text-sm text-gray-500 italic">No specific threat patterns matched.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
