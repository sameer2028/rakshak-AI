import { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, PhoneIncoming, AlertTriangle, ShieldCheck, ShieldAlert, Check, Copy, User, Activity, Clock } from 'lucide-react';
import { scamDetectionApi } from '../../api/scam-detection.api';

const SCAM_SCENARIOS = {
  bank: {
    name: "SBI Account Block",
    callerId: "+91 98765 43210",
    script: [
      { time: 2, speaker: "caller", text: "Hello sir. This is Rahul calling from SBI Bank." },
      { time: 5, speaker: "caller", text: "We have detected unusual activity on your account." },
      { time: 9, speaker: "caller", text: "Your account will be blocked today if we don't verify it." },
      { time: 13, speaker: "receiver", text: "Blocked? Why?" },
      { time: 16, speaker: "caller", text: "Yes sir, a security protocol. Please share the 6-digit OTP sent to your phone immediately to stop the block." }
    ]
  },
  customs: {
    name: "FedEx Customs Intercept",
    callerId: "+91 88888 11111",
    script: [
      { time: 2, speaker: "caller", text: "Hello, this is Officer Sharma from the CBI Customs Department." },
      { time: 6, speaker: "caller", text: "We have intercepted a FedEx package in your name." },
      { time: 10, speaker: "caller", text: "It contains 5 passports and illegal narcotics linked to your Aadhaar card." },
      { time: 15, speaker: "receiver", text: "That's impossible! I didn't send any package." },
      { time: 18, speaker: "caller", text: "An arrest warrant has been issued. You are under digital arrest. You must transfer a security deposit of 5 lakh rupees to verify your accounts." }
    ]
  },
  kyc: {
    name: "Urgent Paytm KYC",
    callerId: "+91 77777 22222",
    script: [
      { time: 2, speaker: "caller", text: "Hello, calling from Paytm KYC department." },
      { time: 5, speaker: "caller", text: "Your KYC is expiring in 2 hours." },
      { time: 8, speaker: "caller", text: "Your wallet will be permanently deactivated." },
      { time: 12, speaker: "receiver", text: "What do I need to do?" },
      { time: 15, speaker: "caller", text: "Click the link I just sent via SMS and download the remote support app so I can guide you." }
    ]
  }
};

export default function CallSimulator({ onSubmit, onLiveResult, isLoading }) {
  const [view, setView] = useState('select'); // select, ringing, active, summary
  const [selectedScenario, setSelectedScenario] = useState(null);

  // Active Call State
  const [duration, setDuration] = useState(0);
  const [history, setHistory] = useState([]);
  const [scriptIndex, setScriptIndex] = useState(0);

  // AI Live State
  const [liveRisk, setLiveRisk] = useState(0);
  const [liveIndicators, setLiveIndicators] = useState([]);
  const [liveConfidence, setLiveConfidence] = useState(0);

  const chatEndRef = useRef(null);
  const timerRef = useRef(null);

  // Auto-scroll transcript
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history]);

  const acceptCall = () => {
    setView('active');
    setDuration(0);
    setHistory([]);
    setScriptIndex(0);
    setLiveRisk(0);
    setLiveIndicators([]);
    setLiveConfidence(0);
    if (onLiveResult) onLiveResult(null);
  };

  const rejectCall = () => {
    setView('select');
    setSelectedScenario(null);
  };

  // Main Call Timer & Script Logic
  useEffect(() => {
    if (view === 'active') {
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [view]);

  // Progress the script based on duration
  useEffect(() => {
    if (view === 'active' && selectedScenario) {
      const scenario = SCAM_SCENARIOS[selectedScenario];
      if (scriptIndex < scenario.script.length) {
        const nextLine = scenario.script[scriptIndex];
        if (duration >= nextLine.time) {
          setHistory(prev => [...prev, nextLine]);
          setScriptIndex(prev => prev + 1);
          triggerLiveAnalysis([...history, nextLine]);
        }
      } else if (duration > scenario.script[scenario.script.length - 1].time + 3) {
        // End call 3 seconds after last line
        endCall();
      }
    }
  }, [duration, view, selectedScenario, scriptIndex, history]);

  // The Live AI Polling
  const triggerLiveAnalysis = async (currentHistory) => {
    const transcriptString = currentHistory.map(line => {
      const speakerName = line.speaker === 'caller' ? 'Caller' : 'Receiver';
      return `[00:${String(line.time).padStart(2, '0')}] ${speakerName}: ${line.text}`;
    }).join('\n');

    try {
      const response = await scamDetectionApi.analyzeLive({
        transcript: transcriptString,
        phone_metadata: { is_voip: true }
      });
      if (response.data) {
        setLiveRisk(response.data.risk_score);
        setLiveIndicators(response.data.threat_indicators || []);
        setLiveConfidence(Math.round(response.data.confidence * 100));
        if (onLiveResult) {
          onLiveResult(response.data);
        }
      }
    } catch (err) {
      console.error("Live analysis failed", err);
    }
  };

  const endCall = () => {
    clearInterval(timerRef.current);
    setView('summary');
  };

  const reset = () => {
    setView('select');
    setSelectedScenario(null);
    setHistory([]);
    setDuration(0);
    setLiveRisk(0);
    setLiveIndicators([]);
    setLiveConfidence(0);
    if (onLiveResult) onLiveResult(null);
  };

  // Helper to format time
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Highlight dangerous words based on threat indicators
  const highlightDangerousPhrases = (text) => {
    if (!text || liveIndicators.length === 0) return text;

    // Extract keywords from indicators (e.g. "Fear language: 'arrest'")
    let keywords = [];
    liveIndicators.forEach(ind => {
      const match = ind.indicator.match(/'([^']+)'/);
      if (match) keywords.push(match[1]);

      if (ind.category === 'money_demand') keywords.push('OTP', 'transfer', 'lakh', 'money', 'share', 'cvv', 'pin', 'rupees', 'deposit');
      if (ind.category === 'impersonation') keywords.push('CBI', 'Customs', 'SBI', 'Bank', 'Paytm', 'Police', 'Officer', 'FedEx');
      if (ind.category === 'fear_language') keywords.push('arrest', 'warrant', 'blocked', 'FIR', 'deactivated', 'illegal', 'narcotics', 'penalty');
    });

    if (keywords.length === 0) return text;

    // Create safe regex with word boundaries to avoid matching partial words (e.g. "Pay" in "Paytm")
    const uniqueKeywords = [...new Set(keywords)].filter(k => k.length > 2);
    if (uniqueKeywords.length === 0) return text;

    const regex = new RegExp(`\\b(${uniqueKeywords.join('|')})\\b`, 'gi');

    const parts = text.split(regex);
    return parts.map((part, i) =>
      uniqueKeywords.some(k => k.toLowerCase() === part.toLowerCase())
        ? <span key={i} className="text-red-400 font-bold bg-red-500/10 px-1 rounded">{part}</span>
        : part
    );
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* View 1: Select Scenario */}
      {view === 'select' && (
        <div className="flex-1 flex flex-col items-center justify-center space-y-6 py-12">
          <div className="text-center">
            <Phone className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white">Simulated Incoming Call</h3>
            <p className="text-gray-400 mt-2 max-w-sm">
              Select a fake scam scenario to experience how the AI analyzes calls in real-time.
            </p>
          </div>

          <div className="w-full max-w-md space-y-3">
            {Object.entries(SCAM_SCENARIOS).map(([key, scenario]) => (
              <button
                key={key}
                onClick={() => {
                  setSelectedScenario(key);
                  setView('ringing');
                }}
                className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-blue-500 p-4 rounded-xl flex items-center justify-between transition-all"
              >
                <div className="text-left">
                  <h4 className="text-white font-medium">{scenario.name}</h4>
                  <p className="text-sm text-gray-400">{scenario.callerId}</p>
                </div>
                <PhoneIncoming className="w-5 h-5 text-gray-500" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* View 2: Ringing */}
      {view === 'ringing' && selectedScenario && (
        <div className="flex-1 flex flex-col items-center justify-center space-y-12 py-12">
          <div className="text-center space-y-4">
            <div className="w-24 h-24 bg-gray-800 rounded-full mx-auto flex items-center justify-center border-4 border-gray-700 animate-pulse shadow-[0_0_50px_rgba(59,130,246,0.2)]">
              <User className="w-12 h-12 text-gray-400" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white tracking-widest">{SCAM_SCENARIOS[selectedScenario].callerId}</h2>
              <p className="text-lg text-gray-400 mt-1">Unknown Caller</p>
            </div>
            <p className="text-blue-400 text-sm font-medium animate-bounce">Incoming call...</p>
          </div>

          <div className="flex gap-8">
            <button
              onClick={rejectCall}
              className="w-16 h-16 rounded-full bg-red-500/20 text-red-500 border-2 border-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)]"
            >
              <PhoneOff className="w-7 h-7" />
            </button>
            <button
              onClick={acceptCall}
              className="w-16 h-16 rounded-full bg-green-500/20 text-green-500 border-2 border-green-500 flex items-center justify-center hover:bg-green-500 hover:text-white transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] animate-pulse"
            >
              <Phone className="w-7 h-7" />
            </button>
          </div>
        </div>
      )}

      {/* View 3: Active Call */}
      {view === 'active' && selectedScenario && (
        <div className="flex flex-col h-full space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center bg-gray-900/80 p-4 rounded-xl border border-gray-700">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center border border-gray-600">
                <User className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <h3 className="text-white font-bold">{SCAM_SCENARIOS[selectedScenario].callerId}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  {formatTime(duration)}
                </div>
              </div>
            </div>
            <button
              onClick={endCall}
              className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/50 rounded-lg hover:bg-red-500 hover:text-white transition-all flex items-center gap-2 font-medium"
            >
              <PhoneOff className="w-4 h-4" /> End Call
            </button>
          </div>

          <div className="flex-1 flex flex-col">
            {/* Live Transcript */}
            <div className="bg-gray-900/50 border border-gray-700 rounded-xl flex flex-col overflow-hidden h-full">
              <div className="bg-gray-800/80 px-4 py-2 border-b border-gray-700 text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4" /> Live AI Captions
              </div>
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {history.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.speaker === 'receiver' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${msg.speaker === 'receiver'
                        ? 'bg-blue-600/20 text-blue-100 border border-blue-500/30 rounded-tr-sm'
                        : 'bg-gray-800 text-gray-200 border border-gray-700 rounded-tl-sm'
                      }`}>
                      <div className="text-xs text-gray-500 mb-1 font-mono">[{formatTime(msg.time)}] {msg.speaker === 'caller' ? 'Caller' : 'You'}</div>
                      <div>{msg.speaker === 'caller' ? highlightDangerousPhrases(msg.text) : msg.text}</div>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View 4: Summary */}
      {view === 'summary' && selectedScenario && (
        <div className="flex flex-col h-full items-center justify-center space-y-6 py-6 animate-fade-in text-center">
          <PhoneOff className="w-16 h-16 text-gray-500 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Call Ended</h2>
          <p className="text-gray-400 max-w-md">The simulation has concluded. You can review the full AI threat analysis in the panel on the right.</p>

          <button
            onClick={reset}
            className="mt-8 flex items-center justify-center py-3 px-8 border border-transparent rounded-xl text-sm font-semibold text-white bg-gray-800 hover:bg-gray-700 transition-all shadow-lg"
          >
            Start Another Simulation
          </button>
        </div>
      )}
    </div>
  );
}
