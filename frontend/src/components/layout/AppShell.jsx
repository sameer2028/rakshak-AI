import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

/**
 * AppShell - Main layout wrapper with sidebar + header + content area.
 * Used for all authenticated pages.
 */
export default function AppShell() {
  return (
    <div className="flex min-h-screen bg-surface-primary">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 ml-[260px] transition-all duration-300">
        <Header />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
