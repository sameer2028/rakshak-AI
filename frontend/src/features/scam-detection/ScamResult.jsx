import { ShieldAlert, CheckCircle2, AlertTriangle, Shield, CheckCircle, Network } from 'lucide-react';
import { cn } from '../../lib/utils';
import RiskMeter from '../../components/common/RiskMeter';
import { useTranslation } from 'react-i18next';

export default function ScamResult({ result }) {
  const { t } = useTranslation();
  if (!result) return null;

  const { is_scam, scam_type, risk_score, confidence, threat_indicators, recommended_actions, fraud_network_match } = result;

  const isSafe = !is_scam;
  const themeClass = isSafe ? 'text-emerald-400' : 'text-red-400';
  const ThemeIcon = isSafe ? CheckCircle2 : ShieldAlert;

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'critical': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'high': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'medium': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'low': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Overview Card */}
      <div className={cn("glass-card p-6 border flex flex-col md:flex-row items-center gap-8", 
        isSafe ? 'border-emerald-500/30' : 'border-red-500/30'
      )}>
        <div className="flex-shrink-0">
          <RiskMeter score={risk_score} size={120} strokeWidth={10} />
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
            <ThemeIcon className={cn("w-6 h-6", themeClass)} />
            <h3 className="text-xl font-bold text-white tracking-wide">
              {isSafe ? t('no_scam_detected') : t('scam_detected')}
            </h3>
          </div>
          
          <div className="mt-2 text-sm text-gray-400">
            {t('detected_type')}{' '}
            <span className={cn("font-medium uppercase tracking-wider", themeClass)}>
              {scam_type.replace(/_/g, ' ')}
            </span>
          </div>

          <div className="mt-4 flex gap-4 text-xs font-mono text-gray-500 justify-center md:justify-start">
            <span>{t('model_confidence')} <strong className="text-gray-300">{(confidence * 100).toFixed(1)}%</strong></span>
          </div>
        </div>
      </div>

      {!isSafe && (
        <>
          {/* Fraud Network Match Warning */}
          {fraud_network_match?.matched && (
            <div className="relative overflow-hidden bg-gradient-to-r from-red-900/40 via-purple-900/30 to-red-900/40 border-2 border-red-500/50 rounded-xl p-5 animate-pulse-slow">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-purple-500/5 animate-pulse" />
              <div className="relative flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 border border-red-500/30">
                  <Network className="w-6 h-6 text-red-400" />
                </div>
                <div className="flex-1">
                  <h4 className="text-base font-bold text-red-400 flex items-center gap-2 mb-1">
                    {t('fraud_network_match_title')}
                  </h4>
                  <p className="text-sm text-red-200 mb-2">
                    The {fraud_network_match.entity_type === 'phone' ? 'phone number' : fraud_network_match.entity_type === 'upi' ? 'UPI ID' : 'bank account'}{' '}
                    <strong className="text-white font-mono">{fraud_network_match.entity_value}</strong>{' '}
                    was found in our active fraud intelligence network!
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full text-xs font-medium">
                      🕸️ {fraud_network_match.community_name}
                    </span>
                    {fraud_network_match.node_label && (
                      <span className="px-3 py-1 bg-red-500/20 text-red-300 border border-red-500/30 rounded-full text-xs font-medium">
                        Entity: {fraud_network_match.node_label}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Threat Indicators */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              {t('threat_indicators_found')}
            </h4>
            <div className="grid gap-3">
              {threat_indicators?.map((indicator, idx) => (
                <div key={idx} className={cn("p-4 rounded-xl border flex items-start gap-4", getSeverityColor(indicator.severity))}>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h5 className="font-medium text-sm">{indicator.indicator}</h5>
                      <span className="text-[10px] uppercase tracking-wider font-bold opacity-80 bg-black/20 px-2 py-0.5 rounded">
                        {indicator.severity}
                      </span>
                    </div>
                    <p className="text-xs opacity-80 font-mono mt-2">{indicator.evidence}</p>
                  </div>
                </div>
              ))}
              {(!threat_indicators || threat_indicators.length === 0) && (
                <div className="text-gray-500 text-sm italic">{t('no_specific_indicators')}</div>
              )}
            </div>
          </div>

          {/* Action Plan */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-5">
            <h4 className="text-sm font-semibold text-blue-400 flex items-center gap-2 mb-4">
              <Shield className="w-4 h-4" />
              {t('recommended_action_plan')}
            </h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {recommended_actions?.map((action, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                  <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* AI Suggested Response */}
          <div className="bg-blue-900/20 border border-blue-500/30 p-5 rounded-xl flex flex-col">
            <h4 className="text-gray-400 text-sm uppercase tracking-wider mb-4">{t('ai_suggested_response')}</h4>
            <div className="bg-blue-900/40 p-4 rounded-lg text-blue-100 flex-1 flex items-center justify-center text-center text-lg italic">
              {risk_score > 70 
                ? t('response_high_risk') 
                : t('response_low_risk')}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
