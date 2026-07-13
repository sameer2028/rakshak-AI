import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, CheckCircle, ShieldAlert, Cpu } from 'lucide-react';
import api from '../../api/client';

/**
 * UploadSection — drag-and-drop currency note uploader with animated scanning progress.
 *
 * Props:
 *   onVerificationComplete(data) — called with the CCVerifyResponse on success
 */
export default function UploadSection({ onVerificationComplete }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [denomination, setDenomination] = useState(500);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState('');
  const [error, setError] = useState(null);

  const onDrop = useCallback(async (acceptedFiles) => {
    const uploadedFile = acceptedFiles[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setPreviewUrl(URL.createObjectURL(uploadedFile));
      setError(null);

      // 1. Check if filename contains denomination as a standalone number (instant response)
      const name = uploadedFile.name.toLowerCase();
      let matchedDenom = null;
      for (const val of [500, 200, 100, 50, 20, 10]) {
        const regex = new RegExp(`(?:^|[^0-9])${val}(?:$|[^0-9])`);
        if (regex.test(name)) {
          matchedDenom = val;
          break;
        }
      }

      if (matchedDenom) {
        setDenomination(matchedDenom);
      } else {
        // 2. Query backend to auto-detect denomination using OCR / Color analysis
        const formData = new FormData();
        formData.append('file', uploadedFile);
        try {
          const response = await api.post('/cc/detect-denomination', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          if (response.data && response.data.denomination) {
            setDenomination(response.data.denomination);
          }
        } catch (err) {
          console.warn('Could not auto-detect denomination:', err);
        }
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png'] },
    multiple: false,
  });

  const simulateScanningProgress = async () => {
    const steps = [
      'Reading uploaded banknote image...',
      'Verifying illumination and sharpness index...',
      'Applying CLAHE contrast filters & Gaussian blur...',
      'Extracting banknote boundary contours...',
      'Deploying YOLOv11 for security feature anchors...',
      'Running EasyOCR on serial prefixes and text blocks...',
      'Forwarding tensors to EfficientNetV2 classifier...',
      'Computing Grad-CAM activation heatmap vectors...',
      'Compiling decision weights engine...',
    ];

    for (let i = 0; i < steps.length; i++) {
      setScanStep(steps[i]);
      await new Promise((resolve) => setTimeout(resolve, 600));
    }
  };

  const handleVerify = async () => {
    if (!file) {
      setError('Please upload a currency note image first.');
      return;
    }

    setIsScanning(true);
    setError(null);

    const progressPromise = simulateScanningProgress();

    const formData = new FormData();
    formData.append('file', file);
    formData.append('denomination', denomination.toString());

    try {
      const responsePromise = api.post('/cc/verify', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000, // 2-minute timeout for heavy pipeline
      });

      const [, response] = await Promise.all([progressPromise, responsePromise]);
      onVerificationComplete(response.data);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail ||
          'Detection pipeline error. Please ensure the backend is running and try again.'
      );
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="w-full bg-gray-900/50 border border-gray-700/50 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 p-4 opacity-5">
        <Cpu size={120} />
      </div>

      <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-1">
        Upload Banknote for Analysis
      </h2>
      <p className="text-gray-400 text-sm mb-6">
        Select denomination and upload a high-resolution flat image of the banknote front side.
      </p>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-3 bg-red-950/40 border border-red-800/60 text-red-300 px-4 py-3 rounded-lg text-sm mb-6">
          <ShieldAlert size={18} className="shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Drop Zone */}
        <div className="md:col-span-2">
          {!isScanning ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 min-h-[220px] ${
                isDragActive
                  ? 'border-blue-500 bg-blue-950/10'
                  : 'border-gray-700 bg-gray-900/30 hover:border-blue-500/40 hover:bg-blue-950/5'
              }`}
            >
              <input {...getInputProps()} />
              {previewUrl ? (
                <div className="relative max-h-[180px] w-full flex justify-center">
                  <img
                    src={previewUrl}
                    alt="Note preview"
                    className="max-h-[160px] object-contain rounded-lg border border-gray-700 shadow-md"
                  />
                  <div className="absolute bottom-[-16px] bg-cyan-500/20 text-cyan-400 text-xs px-3 py-1 rounded-full border border-cyan-500/30 font-medium">
                    Image Uploaded — Click to Change
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="p-4 bg-gray-800/40 rounded-full inline-block text-cyan-400 mb-3 border border-gray-700">
                    <Upload size={32} />
                  </div>
                  <p className="text-gray-300 font-medium mb-1">Drag and drop your banknote here</p>
                  <p className="text-gray-500 text-xs">Supports PNG, JPG, or JPEG</p>
                </div>
              )}
            </div>
          ) : (
            /* Scanning animation panel */
            <div className="border border-cyan-500/30 rounded-xl p-6 bg-gray-900/40 flex flex-col items-center justify-center min-h-[220px] relative overflow-hidden">
              {previewUrl && (
                <div className="relative max-h-[140px] mb-4 overflow-hidden rounded">
                  <img
                    src={previewUrl}
                    alt="Scanning"
                    className="max-h-[130px] object-contain rounded opacity-30"
                  />
                  {/* Glowing Laser Scanline */}
                  <div className="scanner-laser" />
                </div>
              )}
              <div className="flex items-center gap-3 text-cyan-400 font-semibold mb-2">
                <span className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-ping shrink-0" />
                <span className="text-sm tracking-wide">DIGITAL DIAGNOSTICS SCANNING...</span>
              </div>
              <p className="text-gray-300 text-xs font-mono bg-black/40 border border-gray-800 px-4 py-1.5 rounded-full select-none max-w-full text-center truncate">
                {scanStep}
              </p>
            </div>
          )}
        </div>

        {/* Controls Column */}
        <div className="flex flex-col justify-between">
          <div>
            <label className="text-gray-300 text-xs font-semibold uppercase tracking-wider mb-2 block">
              Select Denomination
            </label>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[10, 20, 50, 100, 200, 500].map((val) => (
                <button
                  key={val}
                  type="button"
                  disabled={isScanning}
                  onClick={() => setDenomination(val)}
                  className={`py-3 px-4 rounded-xl border text-sm font-bold transition-all duration-200 ${
                    denomination === val
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 border-blue-400 text-white shadow-lg'
                      : 'bg-gray-800/40 border-gray-700 text-gray-400 hover:border-gray-600 hover:text-gray-300'
                  }`}
                >
                  ₹{val}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            disabled={!file || isScanning}
            onClick={handleVerify}
            className={`w-full py-4 rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${
              !file
                ? 'bg-gray-800 border border-gray-700 text-gray-500 cursor-not-allowed'
                : isScanning
                ? 'bg-gray-900 border border-cyan-500/20 text-cyan-500 cursor-wait'
                : 'bg-cyan-500 hover:bg-cyan-400 text-gray-950 shadow-lg hover:shadow-cyan-500/20 cursor-pointer'
            }`}
          >
            {isScanning ? (
              <>
                <span className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                Processing AI Verify...
              </>
            ) : (
              <>
                <Cpu size={16} />
                Analyze Note
              </>
            )}
          </button>
        </div>
      </div>

      {/* Footer badges */}
      <div className="border-t border-gray-700/50 pt-4 flex justify-between text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <CheckCircle size={13} className="text-cyan-400" />
          <span>YOLOv11 Feature Detection</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle size={13} className="text-cyan-400" />
          <span>EfficientNetV2 Classifier</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle size={13} className="text-cyan-400" />
          <span>EasyOCR Serial Matching</span>
        </div>
      </div>
    </div>
  );
}
