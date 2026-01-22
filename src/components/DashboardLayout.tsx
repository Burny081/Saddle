import { ReactNode, useState, useEffect } from 'react';
import { Sidebar } from './layout/Sidebar';
import { Topbar } from './layout/Topbar';

interface DashboardLayoutProps {
  children: ReactNode;
  currentView: string;
  onViewChange: (view: string) => void;
}

export function DashboardLayout({ children, currentView, onViewChange }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false); // Start closed by default

  // Handle responsive sidebar - close on mobile resize
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      // Always start closed on mobile
      if (mobile) {
        setSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close sidebar when view changes (navigation occurred)
  useEffect(() => {
    setSidebarOpen(false);
  }, [currentView]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Overlay - always show when sidebar is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - always overlay mode (fixed position) */}
      {/* pointer-events-none when closed to allow clicks on content below */}
      <div className={`fixed z-30 h-full ${!sidebarOpen ? 'pointer-events-none' : ''}`}>
        <Sidebar
          currentView={currentView}
          onViewChange={onViewChange}
          open={sidebarOpen}
        />
      </div>

      {/* Main Content Area - takes full width since sidebar is overlay */}
      <div className="flex flex-1 flex-col overflow-hidden w-full">
        {/* Topbar */}
        <Topbar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          currentView={currentView}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scroll-smooth scrollbar-thin scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40">
          <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
