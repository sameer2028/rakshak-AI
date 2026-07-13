import { useState, useEffect, useRef } from 'react';
import { ShieldCheck, ShieldAlert, Image, Sliders, ChevronRight } from 'lucide-react';

/**
 * FeatureInspector — interactive bounding box overlay over the banknote image.
 *
 * - Click any detected security feature box to see a magnified canvas crop
 * - Toggle between preprocessing filter views (original, grayscale, clahe, threshold, edges)
 * - Shows feature description, status badge, and YOLO confidence bar
 *
 * Props:
 *   data — CCVerifyResponse object from /api/cc/verify
 */
export default function FeatureInspector({ data }) {
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [activeFilter, setActiveFilter] = useState('original');
  const canvasRef = useRef(null);

  // Select first detection on data load
  useEffect(() => {
    if (data.yolo_detections?.length > 0) {
      setSelectedFeature(data.yolo_detections[0]);
    }
  }, [data]);

  // Draw the selected feature crop to the canvas
  useEffect(() => {
    if (!selectedFeature || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new window.Image();
    img.src = data.preprocessed_images[activeFilter] || data.preprocessed_images.original;

    img.onload = () => {
      const [xmin, ymin, xmax, ymax] = selectedFeature.box;
      const cropW = xmax - xmin;
      const cropH = ymax - ymin;
      canvas.width = cropW;
      canvas.height = cropH;
      ctx.drawImage(img, xmin, ymin, cropW, cropH, 0, 0, cropW, cropH);
    };
  }, [selectedFeature, activeFilter, data]);

  const getFeatureDescription = (name) => {
    switch (name) {
      case 'Mahatma Gandhi Watermark':
        return 'Multi-tone translucent portrait of Mahatma Gandhi. Genuine banknotes show smooth three-dimensional depth shading. Fake notes usually show flat binary patterns or are blank.';
      case 'Security Thread':
        return 'Metallic color-shifting thread. Under backlighting, it appears as a continuous dark strip. In sunlight, it shifts from green to blue. Sobel filter validates vertical gradient alignment.';
      case 'RBI Seal':
        return 'Circular seal of the Reserve Bank of India depicting a Tiger and Palm Tree. Circle Hough-transform contours verify shape alignment and emblem complexity index.';
      case 'Ashoka Pillar':
        return 'The Ashoka Pillar emblem on the bottom right. Engraving details are checked using Canny edge density to ensure high-fidelity intaglio print textures.';
      case 'See-through Register':
        return 'Denomination numeral printed in half-shapes on front and back. Under light, they align perfectly to form the full numeral.';
      case 'Latent Image':
        return 'A latent printing region showing the denomination value when tilted at 45 degrees.';
      case 'Serial Number Region (Top Left)':
      case 'Serial Number Region (Bottom Right)':
        return 'Banknote unique alphanumeric identifiers. EasyOCR parses characters and regex validates the standard RBI format (1 digit, 2 letters, 6 digits).';
      default:
        return 'Security detail analyzed using localized computer vision feature checks and bounding box ratio metrics.';
    }
  };

  const filters = ['original', 'grayscale', 'clahe', 'threshold', 'edges'];

  return (
    <div className="w-full bg-gray-900/50 border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* ── Left: Bounding Box Overlay ────────────────────────────── */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-200 flex items-center gap-2">
              <Image size={18} className="text-cyan-400" />
              Interactive Bounding Box Overlay
            </h3>

            {/* Filter toggle */}
            <div className="flex gap-1.5 bg-gray-900/60 p-1 border border-gray-800 rounded-lg">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-2.5 py-1 text-xs uppercase tracking-wider font-bold rounded transition-all ${
                    activeFilter === filter
                      ? 'bg-cyan-500 text-gray-950 shadow-md'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Image + overlays */}
          <div
            className="relative border border-gray-800 rounded-xl overflow-hidden bg-black/30 flex justify-center items-center shadow-inner select-none"
            style={{ minHeight: '380px' }}
          >
            <img
              src={data.preprocessed_images[activeFilter] || data.preprocessed_images.original}
              alt="Banknote processing view"
              className="w-full h-auto object-contain max-h-[420px]"
            />

            {/* YOLO bounding boxes */}
            {data.yolo_detections.map((det, idx) => {
              const [xmin, ymin, xmax, ymax] = det.box;
              const left = `${(xmin / 1000) * 100}%`;
              const top = `${(ymin / 460) * 100}%`;
              const width = `${((xmax - xmin) / 1000) * 100}%`;
              const height = `${((ymax - ymin) / 460) * 100}%`;
              const isSelected = selectedFeature?.name === det.name;

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedFeature(det)}
                  className={`absolute border-2 cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? det.status
                        ? 'border-cyan-400 bg-cyan-500/10 shadow-[0_0_12px_#06b6d4]'
                        : 'border-red-500 bg-red-500/10 shadow-[0_0_12px_#ef4444]'
                      : 'border-blue-500/60 bg-blue-500/5 hover:border-white hover:bg-white/10'
                  }`}
                  style={{ left, top, width, height }}
                  title={`${det.name} (${Math.round(det.confidence * 100)}%)`}
                >
                  <span
                    className={`absolute top-0 left-0 text-[9px] font-bold px-1 py-0.5 rounded-br border-r border-b text-black uppercase ${
                      det.status ? 'bg-cyan-400 border-cyan-400' : 'bg-red-400 border-red-400'
                    }`}
                  >
                    {det.name.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>

          <p className="text-gray-500 text-xs mt-3 italic text-center">
            Click any highlighted box to inspect the specific security region.
          </p>
        </div>

        {/* ── Right: Feature Magnifier ──────────────────────────────── */}
        <div className="w-full lg:w-[360px] flex flex-col justify-between border-l border-gray-800/80 lg:pl-8">
          <div>
            <h3 className="text-lg font-bold text-gray-200 flex items-center gap-2 mb-4">
              <Sliders size={18} className="text-cyan-400" />
              Feature Magnifier
            </h3>

            {selectedFeature ? (
              <div className="flex flex-col gap-4">
                {/* Canvas crop */}
                <div className="flex flex-col items-center bg-black/40 border border-gray-800 p-4 rounded-xl shadow-inner relative">
                  <div className="absolute top-2 left-2 text-xs uppercase font-bold tracking-wider text-gray-500">
                    CROP ({activeFilter})
                  </div>
                  <canvas
                    ref={canvasRef}
                    className="max-h-[140px] max-w-full object-contain rounded-lg border border-gray-700 bg-black/60 shadow-lg"
                  />
                </div>

                {/* Status badge */}
                <div className="flex justify-between items-center bg-gray-900/40 border border-gray-800/60 p-3.5 rounded-xl">
                  <span className="font-semibold text-gray-300 text-sm truncate max-w-[200px]">
                    {selectedFeature.name}
                  </span>
                  {selectedFeature.status ? (
                    <div className="flex items-center gap-1 text-cyan-400 text-xs font-bold bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
                      <ShieldCheck size={14} /> PASSED
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-red-400 text-xs font-bold bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/20">
                      <ShieldAlert size={14} /> FAILED
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="text-gray-400 text-xs uppercase tracking-wider font-bold mb-1.5 block">
                    Security Feature Description
                  </label>
                  <p className="text-gray-300 text-xs leading-relaxed bg-gray-900/20 border border-gray-900/60 p-3 rounded-xl">
                    {getFeatureDescription(selectedFeature.name)}
                  </p>
                </div>

                {/* Confidence bar */}
                <div>
                  <div className="flex justify-between text-xs uppercase tracking-wider font-bold text-gray-400 mb-1">
                    <span>YOLO11 Match Confidence</span>
                    <span className="text-cyan-400">{Math.round(selectedFeature.confidence * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        selectedFeature.status ? 'bg-cyan-400' : 'bg-red-400'
                      }`}
                      style={{ width: `${selectedFeature.confidence * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <ChevronRight size={32} className="animate-pulse mb-2 text-gray-600" />
                <p className="text-sm">Select a feature to verify</p>
              </div>
            )}
          </div>

          {/* Quality metadata footer */}
          <div className="mt-6 border-t border-gray-800/80 pt-4 text-xs text-gray-500 flex flex-col gap-1.5">
            <div><strong>Resolution:</strong> {data.quality_report.resolution}</div>
            <div><strong>Sharpness Score:</strong> {data.quality_report.sharpness_score} index</div>
            <div><strong>Brightness Score:</strong> {data.quality_report.brightness_score} index</div>
          </div>
        </div>
      </div>
    </div>
  );
}
