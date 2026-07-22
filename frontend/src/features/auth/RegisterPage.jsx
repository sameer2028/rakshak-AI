import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldAlert, Mail, Lock, User, Phone, Building, Loader2 } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { ROUTES } from '../../constants/routes';
import { useTranslation } from 'react-i18next';

export default function RegisterPage() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'citizen',
    organization: '',
  });
  
  const navigate = useNavigate();
  const { register, isLoading, error } = useAuthStore();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(formData);
      navigate(ROUTES.LOGIN);
    } catch (err) {
      // Error handled in store
    }
  };

  return (
    <div className="min-h-screen bg-surface-primary flex flex-col justify-center py-6 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 animate-fade-in">
        <div className="flex justify-center">
          <div className="w-16 h-16 flex items-center justify-center">
            <img src="/favicon.svg?v=2" alt="Rakshak AI Logo" className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(0,229,255,0.5)]" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-3xl font-extrabold text-white tracking-tight">
          Create Account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400 uppercase tracking-widest">
          Rakshak AI Intelligence Grid
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10 animate-slide-up">
        <div className="glass-card py-6 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-700/50">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-300">Full Name</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-lg leading-5 bg-gray-900/50 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">Email address</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-lg leading-5 bg-gray-900/50 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">{t('password')}</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-lg leading-5 bg-gray-900/50 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">Phone Number</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-lg leading-5 bg-gray-900/50 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  placeholder="+91..."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">Role</label>
                <div className="mt-1">
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="block w-full pl-3 pr-10 py-2 border border-gray-700 rounded-lg leading-5 bg-gray-900/50 text-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 sm:text-sm appearance-none"
                  >
                    <option value="citizen">Citizen</option>
                    <option value="police">Police</option>
                    <option value="bank">Bank</option>
                    <option value="telecom">Telecom</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300">Organization (Optional)</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building className="h-4 w-4 text-gray-500" />
                  </div>
                  <input
                    name="organization"
                    type="text"
                    value={formData.organization}
                    onChange={handleChange}
                    className="block w-full pl-9 pr-3 py-2 border border-gray-700 rounded-lg leading-5 bg-gray-900/50 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    placeholder="Agency/Bank"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-500/10 p-3 border border-red-500/20">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-400">{error}</h3>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-[0_0_15px_rgba(139,92,246,0.3)] text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
              </button>
            </div>
          </form>

          <div className="mt-4 text-center text-sm">
            <span className="text-gray-400">Already have an account? </span>
            <Link to={ROUTES.LOGIN} className="font-medium text-purple-400 hover:text-purple-300">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
