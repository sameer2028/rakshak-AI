import { useState } from 'react';
import { Mic, PhoneCall, Radio, Send, Loader2, AlertCircle } from 'lucide-react';
import { cn } from "../../lib/utils";

export default function TranscriptInput({ onSubmit, isLoading }) {
  const [formData, setFormData] = useState({
    transcript: '',
    caller_number: '',
    receiver_number: '',
    is_voip: false,
  });

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      transcript: formData.transcript,
      phone_metadata: {
        caller_number: formData.caller_number || null,
        receiver_number: formData.receiver_number || null,
        is_voip: formData.is_voip,
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full gap-6">
      {/* Transcript Area */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex justify-between items-end mb-2 flex-shrink-0">
          <label className="block text-sm font-medium text-gray-300">
            Call Transcript
          </label>
          <span className="text-xs text-blue-400 flex items-center gap-1">
            <Mic className="w-3 h-3" /> Auto-transcription active
          </span>
        </div>
        <div className="relative group flex-1 min-h-0">
          <textarea
            name="transcript"
            required
            value={formData.transcript}
            onChange={handleChange}
            className="block w-full h-full p-4 border border-gray-700 rounded-xl bg-gray-900/50 text-gray-300 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none font-mono text-sm leading-relaxed custom-scrollbar"
            placeholder="Paste the audio transcript here...&#10;&#10;Example:&#10;[00:00] Caller: Hello, am I speaking to John Doe?&#10;[00:05] Receiver: Yes.&#10;[00:07] Caller: This is officer Sharma from the CBI. There is a parcel in your name stopped at customs containing illegal items. You are under digital arrest..."
          />
          {isLoading && (
            <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-[1px] rounded-xl flex items-center justify-center">
              <div className="w-full h-full absolute overflow-hidden rounded-xl">
                <div className="w-full h-[2px] bg-blue-500/50 shadow-glow-blue animate-scan-line absolute" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Metadata Panel */}
      <div className="flex-shrink-0 bg-gray-800/30 border border-gray-700/50 rounded-xl p-5">
        <h4 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
          <Radio className="w-4 h-4 text-gray-400" />
          Call Metadata (Optional)
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Caller Number</label>
            <div className="relative">
              <PhoneCall className="absolute top-1/2 -translate-y-1/2 left-3 w-4 h-4 text-gray-500" />
              <input
                type="text"
                name="caller_number"
                value={formData.caller_number}
                onChange={handleChange}
                className="block w-full pl-9 pr-3 py-2 border border-gray-700 rounded-lg bg-gray-900/50 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="+91..."
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Receiver Number</label>
            <div className="relative">
              <PhoneCall className="absolute top-1/2 -translate-y-1/2 left-3 w-4 h-4 text-gray-500" />
              <input
                type="text"
                name="receiver_number"
                value={formData.receiver_number}
                onChange={handleChange}
                className="block w-full pl-9 pr-3 py-2 border border-gray-700 rounded-lg bg-gray-900/50 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="+91..."
              />
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg border border-gray-700/30">
          <input
            type="checkbox"
            id="is_voip"
            name="is_voip"
            checked={formData.is_voip}
            onChange={handleChange}
            className="w-4 h-4 rounded border-gray-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900 bg-gray-700"
          />
          <label htmlFor="is_voip" className="text-sm text-gray-300 cursor-pointer flex-1 flex justify-between items-center">
            <span>Flag as suspected VoIP / Spoofed Call</span>
            <AlertCircle className="w-4 h-4 text-amber-500/70" />
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || !formData.transcript.trim()}
        className="flex-shrink-0 w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-glow-blue text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Running NLP Analysis...
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            Analyze Transcript
          </>
        )}
      </button>
    </form>
  );
}
