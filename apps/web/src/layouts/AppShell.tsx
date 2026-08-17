import { useEffect, useState, type ReactNode } from 'react';
import { Sidebar } from './Sidebar.js';
import { Topbar } from './Topbar.js';
import {
  AgentRail,
  CommandPalette,
  GlobalSearch,
  NotificationPanel,
} from './Panels.js';

export function AppShell({ children }: { readonly children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [railOpen, setRailOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && (e.key.toLowerCase() === 'k' || e.key === '/')) {
        e.preventDefault();
        setCmdOpen((v) => !v);
      } else if (mod && e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setCmdOpen((v) => !v);
      } else if (e.key === 'Escape') {
        setCmdOpen(false);
        setSearchOpen(false);
        setNotifOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const shellClass = [
    'app-shell',
    sidebarOpen ? 'app-shell--sidebar-open' : '',
    sidebarCollapsed ? 'app-shell--sidebar-collapsed' : '',
    railOpen ? 'shell-main--with-rail' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={shellClass}>
      <Sidebar onNavigate={() => setSidebarOpen(false)} />

      <Topbar
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => {
          if (window.matchMedia('(max-width: 1024px)').matches) {
            setSidebarOpen((v) => !v);
          } else {
            setSidebarCollapsed((v) => !v);
          }
        }}
        onOpenNotifications={() => setNotifOpen((v) => !v)}
        onOpenCommandPalette={() => setCmdOpen(true)}
        onOpenSearch={() => setCmdOpen(true)}
        onOpenVoice={() => (window.location.href = '/voice')}
        onToggleAgentRail={() => setRailOpen((v) => !v)}
        agentRailOpen={railOpen}
      />

      <div className="shell-main">
        <div className="shell-main__content">
          {children}
        </div>
        <AgentRail open={railOpen} onClose={() => setRailOpen(false)} />
      </div>

      <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
