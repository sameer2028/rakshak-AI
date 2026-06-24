import { CheckCircle2, XCircle, AlertTriangle, Fingerprint } from 'lucide-react';
import { cn } from '../../lib/utils';
import VerdictBadge from '../../components/common/VerdictBadge';

export default function DetectionResult({ result }) {
  if (!result) return null;

  const { prediction, confidence, features } = result;
  const isCounterfeit = prediction === 'COUNTERFEIT';
  
  const theme = isCounterfeit 
    ? { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400' }
    : { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400' };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className={cn("glass-card p-6 border flex items-center justify-between", theme.bg, theme.border)}>
        <div>
          <h3 className="text-gray-400 text-sm font-medium mb-2">Detection Result</h3>
          <div className="flex items-center gap-4">
            <VerdictBadge verdict={prediction} className="text-lg px-4 py-1.5" />
            <span className="text-xl font-mono text-white">
              {(confidence * 100).toFixed(1)}% Match
            </span>
          </div>
        </div>
        <div className={cn("p-4 rounded-full bg-black/20", theme.text)}>
          <Fingerprint className="w-8 h-8" />
        </div>
      </div>

      <div className="glass-card p-5 border border-gray-700/50">
        <h4 className="text-sm font-semibold text-white mb-4">Security Features Analysis</h4>
        <div className="space-y-3">
          {features?.map((feature, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-800">
              <div className="flex items-center gap-3">
                {feature.status === 'passed' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                {feature.status === 'failed' && <XCircle className="w-5 h-5 text-red-500" />}
                {feature.status === 'suspicious' && <AlertTriangle className="w-5 h-5 text-amber-500" />}
                <span className="text-sm text-gray-300 capitalize">{feature.feature_name.replace(/_/g, ' ')}</span>
              </div>
              <div className="text-right">
                <span className={cn(
                  "text-xs font-bold uppercase tracking-wider",
                  feature.status === 'passed' ? 'text-emerald-400' :
                  feature.status === 'failed' ? 'text-red-400' : 'text-amber-400'
                )}>
                  {feature.status}
                </span>
                <p className="text-[10px] text-gray-500 font-mono mt-0.5">Conf: {(feature.confidence * 100).toFixed(0)}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
