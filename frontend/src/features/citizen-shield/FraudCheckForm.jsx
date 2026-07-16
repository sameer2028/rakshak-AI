import { useState } from 'react';
import { Send, Loader2, MessageSquare, Phone, CreditCard, Mail } from 'lucide-react';
import { cn } from "../../lib/utils";

export default function FraudCheckForm({ onSubmit, isLoading }) {
  const [formData, setFormData] = useState({
    message: '',
    phone_number: '',
    upi_id: '',
    email: '',
    source: 'sms',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'source') {
      setFormData(prev => ({
        ...prev,
        source: value,
        email: (value === 'sms' || value === 'whatsapp') ? '' : prev.email,
        phone_number: value === 'email' ? '' : prev.phone_number,
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Source Selection */}
      <div className="grid grid-cols-3 gap-3">
        {['sms', 'whatsapp', 'email'].map((source) => (
          <label
            key={source}
            className={cn(
              'flex flex-col items-center justify-center p-3 rounded-xl border cursor-pointer transition-all',
              formData.source === source
                ? 'bg-blue-500/20 border-blue-500/50 text-blue-400 shadow-glow-blue'
                : 'bg-gray-800/30 border-gray-700/50 text-gray-400 hover:bg-gray-800/60 hover:text-gray-300'
            )}
          >
            <input
              type="radio"
              name="source"
              value={source}
              checked={formData.source === source}
              onChange={handleChange}
              className="sr-only"
            />
            <span className="text-sm font-medium capitalize">{source}</span>
          </label>
        ))}
      </div>

      {/* Message/Content */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          Suspicious Message / Content
        </label>
        <div className="relative">
          <MessageSquare className="absolute top-3 left-3 w-5 h-5 text-gray-500" />
          <textarea
            name="message"
            rows="4"
            value={formData.message}
            onChange={handleChange}
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-700 rounded-xl bg-gray-900/50 text-gray-300 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
            placeholder="Paste the suspicious message, transcript, or context here..."
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Phone Number */}
        {formData.source !== 'email' && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Sender Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute top-1/2 -translate-y-1/2 left-3 w-5 h-5 text-gray-500" />
              <input
                type="text"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-700 rounded-xl bg-gray-900/50 text-gray-300 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="+91 98765 43210"
              />
            </div>
          </div>
        )}

        {/* UPI ID */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            UPI ID / VPA
          </label>
          <div className="relative">
            <CreditCard className="absolute top-1/2 -translate-y-1/2 left-3 w-5 h-5 text-gray-500" />
            <input
              type="text"
              name="upi_id"
              value={formData.upi_id}
              onChange={handleChange}
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-700 rounded-xl bg-gray-900/50 text-gray-300 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="username@bank"
            />
          </div>
        </div>

        {/* Email */}
        {formData.source === 'email' && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Sender Email
            </label>
            <div className="relative">
              <Mail className="absolute top-1/2 -translate-y-1/2 left-3 w-5 h-5 text-gray-500" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-700 rounded-xl bg-gray-900/50 text-gray-300 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="sender@suspicious-domain.com"
              />
            </div>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading || (!formData.message && !formData.phone_number && !formData.upi_id && !formData.email)}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-glow-blue text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Analyzing Data...
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            Run Security Check
          </>
        )}
      </button>
    </form>
  );
}

