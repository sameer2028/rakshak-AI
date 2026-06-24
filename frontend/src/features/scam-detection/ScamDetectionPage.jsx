import { useState } from 'react';
import TranscriptInput from './TranscriptInput';
import ScamResult from './ScamResult';
import { scamDetectionApi } from '../../api/scam-detection.api';
import { Phone, ShieldAlert, Cpu } from 'lucide-react';

export default function ScamDetectionPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleAnalyze = async (data) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await scamDetectionApi.analyze(data);
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to analyze transcript');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Phone className="w-8 h-8 text-cyan-400" />
          Digital Arrest Scam Detection
        </h1>
        <p className="text-gray-400 mt-2">
          Analyze call transcripts using NLP to detect impersonation and extortion attempts.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card p-6 border border-gray-700/50">
            <TranscriptInput onSubmit={handleAnalyze} isLoading={isLoading} />
          </div>

          <div className="bg-blue-900/20 border border-blue-500/20 rounded-xl p-4 flex gap-4 items-start">
            <Cpu className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-300">
              <strong className="text-blue-400 block mb-1">AI Engine Active</strong>
              Our NLP model analyzes semantic patterns to detect government impersonators (Fake CBI, ED, Customs).
            </div>
          </div>
        </div>
        
        {/* Result Column */}
        <div className="lg:col-span-7">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm mb-6">
              {error}
            </div>
          )}
          
          {result ? (
            <ScamResult result={result} />
          ) : (
            <div className="h-full min-h-[400px] border border-dashed border-gray-700/50 rounded-2xl flex flex-col items-center justify-center text-gray-500 p-8">
              <ShieldAlert className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-center max-w-sm text-sm">
                Paste a call transcript and click "Analyze" to detect potential scam indicators.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
