import { useState } from 'react';
import TranscriptInput from './TranscriptInput';
import CallSimulator from './CallSimulator';
import LiveMicrophone from './LiveMicrophone';
import AudioUploader from './AudioUploader';
import InteractiveScenario from './InteractiveScenario';
import ScamResult from './ScamResult';
import { scamDetectionApi } from '../../api/scam-detection.api';
import { Phone, ShieldAlert, Cpu, FileText, PhoneCall, Mic, FileAudio, Gamepad2 } from 'lucide-react';

export default function ScamDetectionPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState('manual'); // manual, simulator, live, audio, interactive

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

  const handleAnalyzeAudio = async (formData) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await scamDetectionApi.analyzeAudio(formData);
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to extract and analyze audio');
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'manual', label: 'Paste Text', icon: FileText },
    { id: 'simulator', label: 'Simulator', icon: PhoneCall },
    { id: 'live', label: 'Live Mic', icon: Mic },
    { id: 'audio', label: 'Upload .WAV', icon: FileAudio },
    { id: 'interactive', label: 'Play Game', icon: Gamepad2 },
  ];

  return (
    <div className="max-w-7xl mx-auto flex flex-col h-[calc(100vh-6rem)] animate-fade-in">
      {/* Header */}
      <div className="flex-shrink-0 mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Phone className="w-8 h-8 text-cyan-400" />
          Digital Arrest Scam Detection
        </h1>
        <p className="text-gray-400 mt-2">
          Analyze call transcripts using NLP to detect impersonation and extortion attempts.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 min-h-0">
        {/* Input Column */}
        <div className="lg:col-span-6 flex flex-col gap-6 h-full min-h-0">
          {/* Tabs */}
          <div className="bg-gray-900/50 p-1.5 rounded-xl border border-gray-700/50 flex flex-col gap-1.5">
            <div className="grid grid-cols-3 gap-1.5">
              {tabs.slice(0, 3).map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id); setResult(null); setError(null); }}
                    className={`flex items-center justify-center gap-2 px-2 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-inner'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800 border border-transparent'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{tab.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {tabs.slice(3, 5).map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id); setResult(null); setError(null); }}
                    className={`flex items-center justify-center gap-2 px-2 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-inner'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800 border border-transparent'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="glass-card p-6 border border-gray-700/50 flex-1 flex flex-col min-h-0 overflow-y-auto custom-scrollbar">
            {activeTab === 'manual' && <TranscriptInput onSubmit={handleAnalyze} isLoading={isLoading} />}
            {activeTab === 'simulator' && <CallSimulator onLiveResult={setResult} isLoading={isLoading} />}
            {activeTab === 'live' && <LiveMicrophone onLiveResult={setResult} onSubmit={handleAnalyze} isLoading={isLoading} />}
            {activeTab === 'audio' && <AudioUploader onUploadSubmit={handleAnalyzeAudio} isLoading={isLoading} />}
            {activeTab === 'interactive' && <InteractiveScenario onSubmit={handleAnalyze} isLoading={isLoading} />}
          </div>

          <div className="flex-shrink-0 bg-blue-900/20 border border-blue-500/20 rounded-xl p-4 flex gap-4 items-start">
            <Cpu className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-300">
              <strong className="text-blue-400 block mb-1">AI Engine Active</strong>
              Our NLP model analyzes semantic patterns to detect government impersonators (Fake CBI, ED, Customs).
            </div>
          </div>
        </div>
        
        {/* Result Column */}
        <div className="lg:col-span-6 flex flex-col h-full min-h-0 overflow-y-auto custom-scrollbar pr-2 pb-8">
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
