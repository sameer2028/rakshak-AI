import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, Loader2, AlertCircle } from 'lucide-react';

export default function LiveMicrophone({ onSubmit, isLoading }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Initialize Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-IN'; // Indian English for better local accent parsing

      recognitionRef.current.onresult = (event) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript + ' ';
        }
        setTranscript(currentTranscript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        if (event.error === 'not-allowed') {
          setError('Microphone access denied. Please allow microphone access in your browser.');
        } else {
          setError('Microphone error: ' + event.error);
        }
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        // If it stops automatically, don't keep UI in listening state
        setIsListening(false);
      };
    } else {
      setError('Your browser does not support the Web Speech API. Please try Chrome or Edge.');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleListening = () => {
    setError(null);
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setTranscript(''); // Clear previous
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleAnalyze = () => {
    onSubmit({
      transcript: transcript,
      phone_metadata: { is_voip: false }
    });
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="pb-4 border-b border-gray-700/50">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Mic className="w-5 h-5 text-red-400" />
          Live Microphone Demo
        </h3>
        <p className="text-sm text-gray-400 mt-1">
          Speak directly into your microphone to simulate an ongoing live call.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm flex gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="flex justify-center py-6">
        <button
          onClick={toggleListening}
          className={`relative flex items-center justify-center w-24 h-24 rounded-full transition-all ${
            isListening 
              ? 'bg-red-500/20 text-red-400 border-2 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)] animate-pulse' 
              : 'bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700 hover:text-white'
          }`}
        >
          {isListening ? (
            <Mic className="w-10 h-10" />
          ) : (
            <MicOff className="w-10 h-10" />
          )}
          
          {isListening && (
            <div className="absolute inset-0 rounded-full border-2 border-red-500 animate-ping opacity-20" />
          )}
        </button>
      </div>
      <div className="text-center text-sm font-medium text-gray-300">
        {isListening ? 'Listening... Speak now' : 'Click microphone to start listening'}
      </div>

      <div className="relative group flex-1">
        <textarea
          readOnly
          rows="6"
          value={transcript}
          className="block w-full h-full min-h-[150px] p-4 border border-gray-700 rounded-xl bg-gray-900/50 text-gray-300 focus:outline-none transition-all resize-y font-mono text-sm leading-relaxed"
          placeholder="Your transcribed speech will appear here in real-time..."
        />
      </div>

      <button
        onClick={handleAnalyze}
        disabled={isLoading || !transcript.trim()}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-glow-blue text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Analyzing Speech...
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            Analyze Live Transcript
          </>
        )}
      </button>
    </div>
  );
}
