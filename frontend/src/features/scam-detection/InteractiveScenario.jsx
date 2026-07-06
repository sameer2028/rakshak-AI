import { useState, useRef, useEffect } from 'react';
import { Gamepad2, User, UserCircle, Send, RotateCcw, Loader2 } from 'lucide-react';

const SCENARIO_STEPS = [
  {
    id: 1,
    speaker: 'caller',
    text: "Hello, this is Officer Sharma from the CBI Customs Department. Am I speaking to the owner of this phone number?",
    options: [
      { text: "Yes, who is this?", next: 2 },
      { text: "What do you want?", next: 2 },
      { text: "I don't have time for this.", next: 3 }
    ]
  },
  {
    id: 2,
    speaker: 'caller',
    text: "We have intercepted a FedEx package in your name containing 5 passports and illegal narcotics. It is linked to your Aadhaar card.",
    options: [
      { text: "That's impossible! I didn't send any package.", next: 4 },
      { text: "You have the wrong person.", next: 4 }
    ]
  },
  {
    id: 3,
    speaker: 'caller',
    text: "Sir, this is a serious national security matter. If you disconnect, an arrest warrant will be issued immediately.",
    options: [
      { text: "Okay, okay, tell me what happened.", next: 2 },
      { text: "I am hanging up.", next: 99 } // End early
    ]
  },
  {
    id: 4,
    speaker: 'caller',
    text: "Sir, your identity might have been stolen by a money laundering ring. We need to verify your bank accounts immediately.",
    options: [
      { text: "How do I do that?", next: 5 },
      { text: "I will call the local police myself.", next: 6 }
    ]
  },
  {
    id: 5,
    speaker: 'caller',
    text: "You must transfer 98,500 rupees to our RBI secure escrow account. We will refund it in 30 minutes after verification.",
    options: [
      { text: "Okay, send me the account details.", next: 100 },
      { text: "I won't send you any money.", next: 100 }
    ]
  },
  {
    id: 6,
    speaker: 'caller',
    text: "If you involve local police, you will be arrested for breaking the digital arrest protocol. Do exactly as I say.",
    options: [
      { text: "Okay, what should I do?", next: 5 }
    ]
  }
];

export default function InteractiveScenario({ onSubmit, isLoading }) {
  const [history, setHistory] = useState([]);
  const [currentStepId, setCurrentStepId] = useState(1);
  const [isFinished, setIsFinished] = useState(false);
  
  const chatEndRef = useRef(null);

  useEffect(() => {
    // Initial message
    if (history.length === 0) {
      const firstStep = SCENARIO_STEPS.find(s => s.id === 1);
      setHistory([firstStep]);
    }
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history]);

  const handleOptionSelect = (option) => {
    // Add user's choice to history
    const userMessage = { id: Date.now(), speaker: 'receiver', text: option.text };
    setHistory(prev => [...prev, userMessage]);

    // Determine next step
    if (option.next >= 99) {
      setIsFinished(true);
      return;
    }

    const nextStep = SCENARIO_STEPS.find(s => s.id === option.next);
    if (nextStep) {
      setCurrentStepId(nextStep.id);
      // Simulate delay for caller response
      setTimeout(() => {
        setHistory(prev => [...prev, nextStep]);
      }, 800);
    }
  };

  const handleAnalyze = () => {
    const transcriptString = history.map((msg, index) => {
      const time = `[00:0${index * 5}]`;
      const speakerName = msg.speaker === 'caller' ? 'Fake Officer' : 'Victim (You)';
      return `${time} ${speakerName}: ${msg.text}`;
    }).join('\n');
    
    onSubmit({
      transcript: transcriptString,
      phone_metadata: { is_voip: true }
    });
  };

  const resetScenario = () => {
    const firstStep = SCENARIO_STEPS.find(s => s.id === 1);
    setHistory([firstStep]);
    setCurrentStepId(1);
    setIsFinished(false);
  };

  const currentStep = SCENARIO_STEPS.find(s => s.id === currentStepId);

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex justify-between items-center pb-4 border-b border-gray-700/50">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-orange-400" />
            Interactive Scam Scenario
          </h3>
          <p className="text-sm text-gray-400">Play the role of the victim. Can you spot the red flags?</p>
        </div>
        <button
          onClick={resetScenario}
          className="p-2 bg-gray-800 text-gray-400 border border-gray-700 rounded-lg hover:text-white hover:bg-gray-700 transition-colors"
          title="Restart Scenario"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 bg-gray-900/50 border border-gray-700/50 rounded-xl p-4 overflow-y-auto min-h-[300px] max-h-[300px] flex flex-col space-y-4">
        {history.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.speaker === 'receiver' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 flex gap-3 ${
              msg.speaker === 'receiver' 
                ? 'bg-blue-600 text-white rounded-tr-sm flex-row-reverse' 
                : 'bg-gray-800 text-gray-200 border border-gray-700 rounded-tl-sm'
            }`}>
              {msg.speaker === 'caller' ? (
                <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                  <UserCircle className="w-5 h-5 text-orange-400" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-500/50 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
              <div className="text-sm pt-1.5">{msg.text}</div>
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {!isFinished && history[history.length - 1]?.speaker === 'caller' && (
        <div className="grid grid-cols-1 gap-2 pt-2">
          <p className="text-xs text-gray-400 mb-1 font-medium">Choose your reply:</p>
          {currentStep?.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleOptionSelect(opt)}
              className="text-left w-full py-2.5 px-4 bg-gray-800 hover:bg-blue-600/30 border border-gray-700 hover:border-blue-500 rounded-lg text-sm text-gray-300 transition-colors"
            >
              {opt.text}
            </button>
          ))}
        </div>
      )}

      {isFinished && (
        <div className="bg-gray-800/80 border border-gray-700 p-4 rounded-xl text-center space-y-3">
          <p className="text-gray-300 font-medium">Scenario Finished.</p>
          <button
            onClick={handleAnalyze}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-glow-blue text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing Transcript...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Analyze Entire Conversation
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
