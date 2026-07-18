import { NavLink, useLocation } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import useAuthStore from '../../store/authStore';
import { cn } from '../../lib/utils';
import {
  Shield,
  Phone,
  Network,
  Map,
  Banknote,
  LayoutDashboard,
  Bell,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

const NAV_ITEMS = [
  {
    label: 'Dashboard',
    path: ROUTES.DASHBOARD,
    icon: LayoutDashboard,
    roles: ['police', 'admin'],
  },
  {
    label: 'Citizen Shield',
    path: ROUTES.CITIZEN_SHIELD,
    icon: Shield,
    roles: ['citizen', 'police', 'bank', 'telecom', 'admin'],
  },
  {
    label: 'Scam Detection',
    path: ROUTES.SCAM_DETECTION,
    icon: Phone,
    roles: ['citizen', 'police', 'admin'],
  },
  {
    label: 'Fraud Network',
    path: ROUTES.FRAUD_NETWORK,
    icon: Network,
    roles: ['police', 'bank', 'admin'],
  },
  {
    label: 'Crime Heatmap',
    path: ROUTES.CRIME_HEATMAP,
    icon: Map,
    roles: ['citizen', 'police', 'bank', 'telecom', 'admin'],
  },
  {
    label: 'Counterfeit',
    path: ROUTES.COUNTERFEIT,
    icon: Banknote,
    roles: ['police', 'bank', 'admin'],
  },
  {
    label: 'Alerts',
    path: ROUTES.ALERTS,
    icon: Bell,
    roles: ['police', 'admin'],
  },
];

export default function Sidebar({ collapsed, onToggle, mobileMenuOpen, setMobileMenuOpen }) {
  const { user, logout } = useAuthStore();
  const location = useLocation();

  const visibleItems = NAV_ITEMS.filter(
    (item) => item.roles.includes(user?.role)
  );

  return (
    <aside
      className={cn(
        'fixed top-0 left-0 h-screen z-50 flex flex-col transition-all duration-300',
        'bg-surface-primary/95 backdrop-blur-xl border-r border-gray-800/50',
        // Desktop
        'md:translate-x-0',
        collapsed ? 'md:w-[72px]' : 'md:w-[260px]',
        // Mobile
        'w-[260px]',
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-gray-800/50">
        <div className="w-9 h-9 flex items-center justify-center flex-shrink-0">
          <img src="/favicon.svg?v=2" alt="Rakshak AI Logo" className="w-full h-full object-contain" />
        </div>
        {!collapsed && (
          <div className="animate-fade-in">
            <h1 className="text-sm font-bold text-white tracking-wide">RAKSHAK AI</h1>
            <p className="text-[10px] text-gray-500 tracking-widest uppercase">Intelligence Grid</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileMenuOpen?.(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
                'text-sm font-medium',
                isActive
                  ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20 shadow-glow-blue'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              )}
            >
              <Icon
                className={cn(
                  'w-5 h-5 flex-shrink-0 transition-colors',
                  isActive ? 'text-blue-400' : 'text-gray-500 group-hover:text-blue-400'
                )}
              />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="border-t border-gray-800/50 p-3 space-y-2">
        {/* Profile */}
        <NavLink
          to={ROUTES.PROFILE}
          onClick={() => setMobileMenuOpen?.(false)}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all',
            'text-gray-400 hover:text-white hover:bg-gray-800/50',
            location.pathname === ROUTES.PROFILE && 'bg-blue-500/15 text-blue-400'
          )}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-white">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role || 'citizen'}</p>
            </div>
          )}
        </NavLink>

        {/* Logout */}
        <button
          onClick={() => {
            logout();
            setMobileMenuOpen?.(false);
          }}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg w-full transition-all',
            'text-gray-500 hover:text-red-400 hover:bg-red-500/10'
          )}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="text-sm">Logout</span>}
        </button>

        {/* Collapse Toggle */}
        <button
          onClick={onToggle}
          className="hidden md:flex items-center justify-center w-full py-2 rounded-lg text-gray-600 hover:text-gray-400 hover:bg-gray-800/50 transition-all"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
}
