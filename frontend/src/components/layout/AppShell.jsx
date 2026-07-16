import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

/**
 * AppShell - Main layout wrapper with sidebar + header + content area.
 * Used for all authenticated pages.
 */
export default function AppShell() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-surface-primary">
      {/* Sidebar */}
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-[72px]' : 'ml-[260px]'}`}>
        <Header />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
