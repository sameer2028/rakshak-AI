import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

/**
 * AppShell - Main layout wrapper with sidebar + header + content area.
 * Used for all authenticated pages.
 */
export default function AppShell() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  return (
    <div className="flex min-h-screen bg-surface-primary">
      {/* Sidebar */}
      <Sidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 w-full min-w-0 ${sidebarCollapsed ? 'md:ml-[72px]' : 'md:ml-[260px]'}`}>
        <Header onMenuClick={() => setMobileMenuOpen(true)} />
        <main className="p-4 md:p-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
