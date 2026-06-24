import { useState } from 'react';
import { Banknote, ShieldAlert } from 'lucide-react';
import ImageUpload from './ImageUpload';
import DetectionResult from './DetectionResult';
import { counterfeitApi } from '../../api/counterfeit.api';

export default function CounterfeitPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleUpload = async (file) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await counterfeitApi.detect(formData);
      setResult(response.data);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : (detail?.[0]?.msg || 'Failed to process image'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Banknote className="w-8 h-8 text-emerald-400" />
            Counterfeit Currency Detection
          </h1>
          <p className="text-gray-400 mt-2">
            Upload images of currency notes for AI-powered security feature verification.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="glass-card p-6 border border-gray-700/50">
            <h2 className="text-lg font-semibold text-white mb-6">Upload Note</h2>
            <ImageUpload onUpload={handleUpload} isLoading={isLoading} />
          </div>
        </div>

        <div className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
              {error}
            </div>
          )}
          
          {result ? (
            <DetectionResult result={result} />
          ) : (
            <div className="h-full min-h-[400px] border border-dashed border-gray-700/50 rounded-2xl flex flex-col items-center justify-center text-gray-500 p-8 glass-card">
              <ShieldAlert className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-center max-w-sm text-sm">
                Upload a clear image of a currency note. The system will analyze watermarks, security threads, and micro-text to determine authenticity.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
