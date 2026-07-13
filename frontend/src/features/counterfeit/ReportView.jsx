import { useState } from 'react';
import { ShieldCheck, ShieldAlert, FileText, Check, X, Search, Cpu } from 'lucide-react';

/**
 * ReportView — displays the full verification verdict including:
 *   - SVG confidence gauge
 *   - Genuine / Suspicious / Counterfeit verdict badge
 *   - Security checklist (from decision.checklist)
 *   - OCR inspection panel
 *   - Grad-CAM explainability overlay with opacity slider
 *
 * Props:
 *   data — CCVerifyResponse object from /api/cc/verify
 */
export default function ReportView({ data }) {
  const [heatmapAlpha, setHeatmapAlpha] = useState(0.5);
  const { decision, ocr_results } = data;

  const score = decision.confidence;
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getSeverityColors = () => {
    if (decision.is_genuine) {
      return {
        text: 'text-cyan-400',
        bg: 'bg-cyan-500/10',
        border: 'border-cyan-500/20',
        stroke: '#06b6d4',
        icon: <ShieldCheck size={28} className="text-cyan-400" />,
        label: 'GENUINE',
      };
    }
    if (score >= 50) {
      return {
        text: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
        stroke: '#f59e0b',
        icon: <ShieldAlert size={28} className="text-amber-400" />,
        label: 'SUSPICIOUS',
      };
    }
    return {
      text: 'text-red-400',
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
      stroke: '#ef4444',
      icon: <ShieldAlert size={28} className="text-red-400" />,
      label: 'COUNTERFEIT',
    };
  };

  const colors = getSeverityColors();

  return (
    <div className="w-full bg-gray-900/50 border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
      <h3 className="text-lg font-bold text-gray-200 flex items-center gap-2 mb-6 border-b border-gray-800 pb-4">
        <FileText size={18} className="text-cyan-400" />
        Verification Report Details
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Left: SVG Gauge + Verdict ────────────────────────────── */}
        <div className="flex flex-col items-center justify-between bg-gray-900/20 border border-gray-900/60 p-6 rounded-2xl">
          <div className="flex flex-col items-center text-center">
            {/* Circular Gauge */}
            <div className="relative w-36 h-36 flex items-center justify-center mb-6">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="72" cy="72" r={radius} stroke="#1f2937" strokeWidth="10" fill="transparent" />
                <circle
                  cx="72"
                  cy="72"
                  r={radius}
                  stroke={colors.stroke}
                  strokeWidth="10"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-black text-white">{Math.round(score)}%</span>
                <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">CONFIDENCE</span>
              </div>
            </div>

            {/* Verdict badge */}
            <div className={`flex items-center gap-2 px-5 py-2.5 rounded-full border ${colors.bg} ${colors.border} mb-4`}>
              {colors.icon}
              <span className={`text-base font-extrabold uppercase tracking-widest ${colors.text}`}>
                {colors.label}
              </span>
            </div>

            <p className="text-gray-300 text-xs leading-relaxed px-2">{decision.verdict_summary}</p>
          </div>

          <div className="w-full mt-6 pt-4 border-t border-gray-800/80 text-center text-xs text-gray-500 uppercase tracking-wider font-bold">
            Analyzed: {new Date(data.created_at).toLocaleTimeString()}
          </div>
        </div>

        {/* ── Middle: Security Checklist + OCR ─────────────────────── */}
        <div className="flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
              Security Checklist
            </h4>
            <div className="flex flex-col gap-3">
              {Object.entries(decision.checklist).map(([feature, passed]) => (
                <div
                  key={feature}
                  className="flex items-center justify-between bg-gray-900/40 border border-gray-800/60 py-2.5 px-4 rounded-xl"
                >
                  <span className="text-xs text-gray-300 font-medium">{feature}</span>
                  {passed ? (
                    <div className="w-5 h-5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full flex items-center justify-center shrink-0">
                      <Check size={12} strokeWidth={3} />
                    </div>
                  ) : (
                    <div className="w-5 h-5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full flex items-center justify-center shrink-0">
                      <X size={12} strokeWidth={3} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* OCR Panel */}
          <div className="mt-6 bg-gray-900/30 border border-gray-800 rounded-xl p-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1">
              <Cpu size={12} className="text-cyan-400" />
              OCR Text Inspections
            </h4>
            <div className="flex flex-col gap-2 text-xs">
              <div className="flex justify-between border-b border-gray-800/40 pb-1.5">
                <span className="text-gray-400">Serial Code:</span>
                <span className={`font-mono font-bold ${ocr_results.serial_number_valid ? 'text-cyan-400' : 'text-red-400'}`}>
                  {ocr_results.serial_number || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-800/40 pb-1.5">
                <span className="text-gray-400">RBI Print:</span>
                <span className={ocr_results.rbi_text_detected ? 'text-cyan-400' : 'text-red-400'}>
                  {ocr_results.rbi_text_detected ? 'DETECTED' : 'MISSING'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Governor Signature:</span>
                <span className={ocr_results.governor_signature_detected ? 'text-cyan-400' : 'text-red-400'}>
                  {ocr_results.governor_signature_detected ? 'VERIFIED' : 'MISSING'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: Grad-CAM Explainability Slider ─────────────────── */}
        <div className="flex flex-col bg-gray-900/20 border border-gray-900/60 p-5 rounded-2xl">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1">
            <Search size={12} className="text-cyan-400" />
            Explainable AI (Grad-CAM)
          </h4>
          <p className="text-gray-400 text-xs leading-relaxed mb-4">
            Audits deep learning activation maps. Red zones indicate where the classifier detected security anomalies.
          </p>

          <div className="relative border border-gray-800 rounded-xl overflow-hidden bg-black/60 flex items-center justify-center grow">
            {/* Base image */}
            <img
              src={data.preprocessed_images.original}
              alt="Original Note"
              className="w-full h-auto object-contain max-h-[220px]"
            />
            {/* Grad-CAM overlay */}
            <img
              src={data.grad_cam_heatmap}
              alt="Grad-CAM Heatmap"
              className="absolute top-0 left-0 w-full h-full object-contain max-h-[220px] pointer-events-none transition-opacity duration-100"
              style={{ opacity: heatmapAlpha }}
            />
          </div>

          {/* Slider */}
          <div className="mt-4">
            <div className="flex justify-between text-xs uppercase tracking-wider font-bold text-gray-400 mb-1">
              <span>Original Note</span>
              <span>CAM Heatmap</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={heatmapAlpha}
              onChange={(e) => setHeatmapAlpha(parseFloat(e.target.value))}
              className="w-full accent-cyan-500 h-1 rounded-lg cursor-pointer appearance-none bg-gray-800"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
