import useAuthStore from '../../store/authStore';
import { Bell, Search, Menu } from 'lucide-react';
import { APP_NAME } from '../../constants/config';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';

export default function Header({ onMenuClick }) {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  return (
    <header className="h-16 border-b border-gray-800/50 bg-surface-primary/80 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-40">
      {/* Left - Page context */}
      <div className="flex items-center gap-4">
        {/* Hamburger Menu for Mobile */}
        <button 
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800/50 transition-all"
        >
          <Menu className="w-6 h-6" />
        </button>

        <h2 className="text-lg font-semibold text-white truncate max-w-[150px] sm:max-w-none">{APP_NAME}</h2>
        <span className="text-xs text-gray-500 hidden md:inline">|</span>
        <span className="text-xs text-gray-500 hidden md:inline tracking-wider uppercase">
          Intelligence Grid
        </span>
      </div>

      {/* Right - Search + Notifications + User */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-1.5">
          <Search className="w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent text-sm text-gray-300 placeholder-gray-600 outline-none w-40"
          />
        </div>

        {/* Notifications Bell */}
        <button 
          onClick={() => navigate(ROUTES.ALERTS)}
          className="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
            3
          </span>
        </button>

        {/* User Badge */}
        <div className="flex items-center gap-2 bg-gray-800/40 rounded-lg px-3 py-1.5 border border-gray-700/30">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
            <span className="text-xs font-bold text-white">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-medium text-gray-200">{user?.name || 'User'}</p>
            <p className="text-[10px] text-gray-500 capitalize">{user?.role || 'citizen'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
