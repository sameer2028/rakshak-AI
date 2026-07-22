import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, Building, PhoneCall, Copy, ArrowRight, ShieldCheck, Check, Fingerprint, Map, AlertTriangle } from 'lucide-react';
import { useToastStore } from '../../store/toastStore';
import { ROUTES } from '../../constants/routes';
import { useTranslation } from 'react-i18next';

const personas = [
  {
    role: 'Admin',
    email: 'admin@rakshak.ai',
    password: 'password123',
    icon: ShieldCheck,
    color: 'from-purple-500 to-indigo-600',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
    textColor: 'text-purple-400',
    access: 'Full system access, all modules, command center, user management.'
  },
  {
    role: 'Police / Analyst',
    email: 'analyst@rakshak.ai',
    password: 'password123',
    icon: Shield,
    color: 'from-blue-500 to-cyan-600',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    textColor: 'text-blue-400',
    access: 'Dashboard, fraud network analysis, crime heatmap, proactive alerts.'
  },
  {
    role: 'Citizen',
    email: 'citizen@example.com',
    password: 'password123',
    icon: Users,
    color: 'from-emerald-500 to-teal-600',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    textColor: 'text-emerald-400',
    access: 'Citizen Shield portal, scam checker, crime heatmap visualization.'
  },
  {
    role: 'Bank',
    email: 'bank@rakshak.ai',
    password: 'password123',
    icon: Building,
    color: 'from-amber-500 to-orange-600',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    textColor: 'text-amber-400',
    access: 'Financial fraud network, counterfeit note detection subsystem.'
  },
  {
    role: 'Telecom',
    email: 'telecom@rakshak.ai',
    password: 'password123',
    icon: PhoneCall,
    color: 'from-pink-500 to-rose-600',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/20',
    textColor: 'text-pink-400',
    access: 'Citizen Shield API, crime heatmap for tower coverage analysis.'
  }
];

export default function ReviewerPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const addToast = useToastStore((state) => state.addToast);
  const [copiedEmail, setCopiedEmail] = useState(null);
  
  const handleCopyEmail = (persona) => {
    navigator.clipboard.writeText(persona.email).then(() => {
      setCopiedEmail(persona.email);
      addToast(`Copied ${persona.role} email`, 'success');
      setTimeout(() => setCopiedEmail(null), 3000);
    });
  };

  const handleCopyPassword = (password) => {
    navigator.clipboard.writeText(password).then(() => {
      addToast('Copied password', 'success');
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-indigo-500/30 overflow-x-hidden relative font-sans">
      
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/20 blur-[100px]" />
        <div className="absolute top-[40%] right-[10%] w-[30%] h-[30%] rounded-full bg-emerald-900/10 blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col items-center">
        
        {/* Header Hero Section */}
        <div className="text-center mb-16 space-y-6 max-w-3xl animate-in fade-in slide-in-from-bottom-6 duration-1000">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-slate-900/50 border border-slate-700 backdrop-blur-sm mb-4 shadow-lg shadow-black/20">
            <Fingerprint className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-medium tracking-wide text-slate-300">Reviewer Portal</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">{t('welcome')}</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 leading-relaxed font-light">
            Experience the platform through different perspectives. Copy the credentials below and log in to explore the specific modules and dashboards tailored for each persona.
          </p>
          <div className="pt-4">
            <button 
              onClick={() => navigate(ROUTES.LOGIN)}
              className="inline-flex items-center justify-center space-x-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition-all duration-300 hover:shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:-translate-y-0.5"
            >
              <span>Go to Login Portal</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Personas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
          {personas.map((persona, index) => (
            <div 
              key={persona.role}
              className="group relative bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 transition-all duration-500 hover:bg-slate-800/50 hover:border-slate-600 hover:-translate-y-1 hover:shadow-2xl overflow-hidden"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Subtle hover gradient background */}
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-br ${persona.color} transition-opacity duration-500`} />
              
              {/* Header */}
              <div className="flex items-center justify-between mb-6 relative z-10">
                <div className={`p-3 rounded-xl ${persona.bgColor} ${persona.borderColor} border shadow-inner`}>
                  <persona.icon className={`w-6 h-6 ${persona.textColor}`} />
                </div>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 group-hover:text-slate-400 transition-colors">
                  {persona.role}
                </div>
              </div>

              {/* Credentials */}
              <div className="space-y-4 mb-6 relative z-10">
                <div>
                  <div className="text-xs text-slate-500 mb-1">{t('email')}</div>
                  <button 
                    onClick={() => handleCopyEmail(persona)}
                    className="w-full text-sm font-mono text-slate-300 bg-slate-950/50 p-2 rounded-lg border border-slate-800 flex items-center justify-between hover:border-indigo-500/50 hover:bg-slate-900 transition-colors group/copy"
                  >
                    <span className="truncate pr-2">{persona.email}</span>
                    {copiedEmail === persona.email ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-slate-500 group-hover/copy:text-indigo-400" />
                    )}
                  </button>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">{t('password')}</div>
                  <button 
                    onClick={() => handleCopyPassword(persona.password)}
                    className="w-full text-sm font-mono text-slate-300 bg-slate-950/50 p-2 rounded-lg border border-slate-800 flex items-center justify-between hover:border-indigo-500/50 hover:bg-slate-900 transition-colors group/copy"
                  >
                    <span>{persona.password}</span>
                    <Copy className="w-4 h-4 text-slate-500 group-hover/copy:text-indigo-400" />
                  </button>
                </div>
              </div>

              {/* Access Description */}
              <div className="mb-6 relative z-10">
                <div className="text-xs text-slate-500 mb-2">Has Access To</div>
                <p className="text-sm text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                  {persona.access}
                </p>
              </div>

              {/* Actions removed since copy is now inline */}
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="mt-16 text-center text-sm text-slate-500 flex items-center justify-center space-x-2">
          <AlertTriangle className="w-4 h-4" />
          <span>Note: All roles share the same password for testing convenience.</span>
        </div>
      </div>
    </div>
  );
}
