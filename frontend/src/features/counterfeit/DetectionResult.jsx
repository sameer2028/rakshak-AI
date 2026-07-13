import { CheckCircle2, XCircle, AlertTriangle, Fingerprint, ShieldAlert, ShieldCheck, Info } from 'lucide-react';
import { cn } from '../../lib/utils';
import VerdictBadge from '../../components/common/VerdictBadge';

const FEATURE_LABELS = {
  watermark: 'Watermark',
  security_thread: 'Security Thread',
  micro_text: 'Micro Text',
  color_shift_ink: 'Colour-Shift Ink',
  serial_pattern: 'Serial Number Pattern',
  intaglio_print: 'Intaglio Print',
  ashoka_emblem: 'Ashoka Pillar Emblem',
};

function StatusIcon({ status }) {
  if (status === 'pass') return <CheckCircle2 className="w-5 h-5 text-cyan-500" />;
  if (status === 'fail') return <XCircle className="w-5 h-5 text-red-500" />;
  return <AlertTriangle className="w-5 h-5 text-amber-500" />;
}

function StatusLabel({ status }) {
  const colors = {
    pass: 'text-cyan-400',
    fail: 'text-red-400',
    inconclusive: 'text-amber-400',
  };
  return (
    <span className={cn("text-xs font-bold uppercase tracking-wider", colors[status] || 'text-gray-400')}>
      {status === 'pass' ? 'Passed' : status === 'fail' ? 'Failed' : 'Inconclusive'}
    </span>
  );
}

export default function DetectionResult({ result }) {
  if (!result) return null;

  const { prediction, confidence, security_features, verdict_summary, reasons } = result;
  const isCounterfeit = prediction === 'COUNTERFEIT';

  const theme = isCounterfeit
    ? { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', glow: 'bg-red-500' }
    : { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400', glow: 'bg-cyan-500' };

  // Convert security_features object → array for rendering
  const featureEntries = security_features
    ? Object.entries(security_features).map(([key, status]) => ({
        key,
        label: FEATURE_LABELS[key] || key.replace(/_/g, ' '),
        status,
      }))
    : [];

  const failCount = featureEntries.filter(f => f.status === 'fail').length;
  const passCount = featureEntries.filter(f => f.status === 'pass').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ─── Verdict Banner ─── */}
      <div className={cn(
        "rounded-2xl border p-6 relative overflow-hidden",
        theme.bg, theme.border
      )}>
        {/* Glow */}
        <div className={cn("absolute -top-16 -right-16 w-32 h-32 rounded-full blur-[60px] opacity-20", theme.glow)} />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-2">Detection Result</h3>
              <div className="flex items-center gap-4">
                <VerdictBadge verdict={prediction} className="text-lg px-4 py-1.5" />
                <span className="text-2xl font-mono font-bold text-white">
                  {(confidence * 100).toFixed(1)}%
                </span>
              </div>
            </div>
            <div className={cn("p-4 rounded-full bg-black/30 border", theme.border, theme.text)}>
              <Fingerprint className="w-8 h-8" />
            </div>
          </div>

          {/* Clear FAKE / GENUINE statement */}
          <div className={cn(
            "mt-4 p-4 rounded-xl border flex items-start gap-3",
            isCounterfeit
              ? "bg-red-950/40 border-red-500/20"
              : "bg-cyan-950/40 border-cyan-500/20"
          )}>
            {isCounterfeit
              ? <ShieldAlert className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
              : <ShieldCheck className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-0.5" />
            }
            <div>
              <p className={cn("text-sm font-semibold", theme.text)}>
                {verdict_summary || (isCounterfeit
                  ? `⚠️ This note is FAKE. ${failCount} security features failed.`
                  : `✅ This note appears GENUINE. ${passCount} features passed.`
                )}
              </p>
              {isCounterfeit && (
                <p className="text-xs text-gray-400 mt-1">
                  Do NOT accept this note. Report to the nearest bank or police station.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Why It's Fake — Reasons ─── */}
      {reasons && reasons.length > 0 && (
        <div className="glass-card p-5 border border-gray-700/50 rounded-xl">
          <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Info className="w-4 h-4 text-gray-400" />
            {isCounterfeit ? 'Why This Note is Fake' : 'Analysis Details'}
          </h4>
          <ul className="space-y-3">
            {reasons.map((reason, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm text-gray-300 bg-gray-800/30 p-3 rounded-lg border border-gray-700/30">
                <XCircle className={cn("w-4 h-4 mt-0.5 flex-shrink-0", isCounterfeit ? "text-red-400" : "text-amber-400")} />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ─── Security Features Grid ─── */}
      <div className="glass-card p-5 border border-gray-700/50 rounded-xl">
        <h4 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
          <Fingerprint className="w-4 h-4 text-gray-400" />
          Security Features Analysis
        </h4>
        <p className="text-xs text-gray-500 mb-4">
          {passCount} passed · {failCount} failed · {featureEntries.length - passCount - failCount} inconclusive
        </p>

        <div className="space-y-2">
          {featureEntries.map((feature) => (
            <div key={feature.key} className={cn(
              "flex items-center justify-between p-3 rounded-lg border transition-colors",
              feature.status === 'fail'
                ? "bg-red-500/5 border-red-500/20"
                : feature.status === 'pass'
                ? "bg-cyan-500/5 border-cyan-500/10"
                : "bg-gray-900/50 border-gray-800"
            )}>
              <div className="flex items-center gap-3">
                <StatusIcon status={feature.status} />
                <span className="text-sm text-gray-300 capitalize">{feature.label}</span>
              </div>
              <StatusLabel status={feature.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
