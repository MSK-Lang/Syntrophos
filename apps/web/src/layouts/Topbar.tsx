import { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  IconBell,
  IconChevronDown,
  IconCloud,
  IconCommand,
  IconMenu,
  IconMic,
  IconMoon,
  IconProviders,
  IconSearch,
  IconSettings,
  IconSun,
  IconWorkspace,
} from '@/lib/icons.jsx';
import { useAuth, useNotifications, useSync, useWorkspace } from '@/lib/services/index.js';
import { useTheme } from '@/lib/theme.js';

export type TopbarProps = {
  readonly sidebarOpen: boolean;
  readonly onToggleSidebar: () => void;
  readonly onOpenNotifications: () => void;
  readonly onOpenCommandPalette: () => void;
  readonly onOpenSearch: () => void;
  readonly onToggleAgentRail: () => void;
  readonly agentRailOpen: boolean;
  readonly onOpenVoice: () => void;
};

export function Topbar({
  sidebarOpen,
  onToggleSidebar,
  onOpenNotifications,
  onOpenCommandPalette,
  onOpenSearch,
  onToggleAgentRail,
  agentRailOpen,
  onOpenVoice,
}: TopbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentWorkspace, list: listWorkspaces, switchTo } = useWorkspace();
  const { resolvedTheme, toggleTheme } = useTheme();
  const { getCurrentState } = useSync();
  const [unread, setUnread] = useState(0);
  const [syncState, setSyncState] = useState<{ lastSyncAt?: string; pendingLocal: number } | null>(null);
  const { getUnreadCount } = useNotifications();
  const [wsMenuOpen, setWsMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [workspaceList, setWorkspaceList] = useState<ReadonlyArray<{ id: string; settings: { name: string } }>>([]);

  useEffect(() => {
    void (async () => {
      try {
        setUnread(await getUnreadCount());
      } catch {
        /* ignore */
      }
    })();
  }, [getUnreadCount]);

  useEffect(() => {
    void (async () => {
      try {
        setSyncState(await getCurrentState());
      } catch {
        /* ignore */
      }
    })();
  }, [getCurrentState]);

  useEffect(() => {
    if (!wsMenuOpen) return;
    void (async () => {
      const r = await listWorkspaces({ pageSize: 10 });
      setWorkspaceList(r.items);
    })();
  }, [wsMenuOpen, listWorkspaces]);

  const crumbs = buildCrumbs(location.pathname);

  return (
    <header className="shell-topbar" role="banner">
      <div className="shell-topbar__crumbs" aria-label="Breadcrumb">
        <button
          type="button"
          className="shell-topbar__toggle ui-btn ui-btn--ghost ui-btn--icon"
          aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          aria-expanded={sidebarOpen}
          onClick={onToggleSidebar}
        >
          <IconMenu width={18} height={18} />
        </button>
        <nav aria-label="You are here">
          <ol role="list" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            {crumbs.map((crumb, i) => (
              <li key={crumb.to} style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                {i > 0 && (
                  <IconChevronDown
                    width={12}
                    height={12}
                    style={{ transform: 'rotate(-90deg)', color: 'var(--color-text-subtle)' }}
                    aria-hidden="true"
                  />
                )}
                {i === crumbs.length - 1 ? (
                  <span className="shell-topbar__crumb shell-topbar__crumb--current" aria-current="page">
                    {crumb.label}
                  </span>
                ) : (
                  <Link to={crumb.to} className="shell-topbar__crumb">
                    {crumb.label}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>
      </div>

      <div className="shell-topbar__search">
        <button
          type="button"
          className="shell-topbar__search-btn"
          onClick={onOpenSearch}
          aria-haspopup="dialog"
        >
          <IconSearch width={16} height={16} aria-hidden="true" />
          <span>Search your workspace, notes, tasks, agents…</span>
          <span className="shell-topbar__search-kbd" aria-hidden="true">
            <kbd>⌘</kbd>
            <kbd>K</kbd>
          </span>
        </button>
      </div>

      <div className="shell-topbar__actions">
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className="shell-topbar__workspace"
            aria-haspopup="menu"
            aria-expanded={wsMenuOpen}
            onClick={() => setWsMenuOpen((v) => !v)}
            onBlur={() => setTimeout(() => setWsMenuOpen(false), 150)}
          >
            <span
              aria-hidden="true"
              style={{
                width: 28, height: 28, borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, var(--color-primary-500), var(--color-accent-violet))',
                color: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, fontSize: 12, fontWeight: 600,
              }}
            >
              <IconWorkspace width={14} height={14} />
            </span>
            <span className="shell-topbar__workspace-name">
              {currentWorkspace.status === 'success' ? currentWorkspace.data.settings.name : 'Workspace'}
            </span>
            <IconChevronDown width={14} height={14} aria-hidden="true" style={{ color: 'var(--color-text-subtle)' }} />
          </button>
          {wsMenuOpen && (
            <div
              className="panel panel--notif"
              style={{ width: 280, top: 48, right: 'auto', left: 0, bottom: 'auto' }}
              onMouseDown={(e) => e.preventDefault()}
            >
              <div className="panel__head">
                <div className="panel__title" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-subtle)' }}>
                  Switch workspace
                </div>
              </div>
              <div className="panel__body">
                <ul role="list" style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                  {workspaceList.map((w) => (
                    <li key={w.id}>
                      <button
                        type="button"
                        className="cmd-item"
                        style={{ width: '100%', textAlign: 'left', border: 'none', background: 'transparent', borderRadius: 'var(--radius-sm)' }}
                        onClick={() => {
                          void switchTo(w.id);
                          setWsMenuOpen(false);
                        }}
                      >
                        <div className="cmd-item__icon">
                          <span
                            style={{
                              width: 20, height: 20, borderRadius: 'var(--radius-sm)',
                              background: currentWorkspace.status === 'success' && currentWorkspace.data.id === w.id
                                ? 'var(--color-primary-500)'
                                : 'var(--color-border-strong)',
                              color: currentWorkspace.status === 'success' && currentWorkspace.data.id === w.id
                                ? 'white' : 'var(--color-text-muted)',
                              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 10, fontWeight: 600,
                            }}
                          >
                            {w.settings.name.slice(0, 1)}
                          </span>
                        </div>
                        <div className="cmd-item__text">
                          <div className="cmd-item__title">{w.settings.name}</div>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="panel__footer">
                <Link to="/workspaces" style={{ textDecoration: 'none', fontSize: 12 }}>Manage workspaces</Link>
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          className="shell-topbar__action-btn"
          onClick={toggleTheme}
          aria-label={`Toggle color theme (currently ${resolvedTheme})`}
          title={`Theme: ${resolvedTheme}`}
        >
          {resolvedTheme === 'dark' ? <IconSun width={18} height={18} /> : <IconMoon width={18} height={18} />}
        </button>

        <button
          type="button"
          className="shell-topbar__action-btn"
          onClick={onOpenVoice}
          aria-label="Open voice mode"
          title="Voice mode"
        >
          <IconMic width={18} height={18} />
        </button>

        <Link
          to="/settings/sync"
          className="shell-topbar__action-btn"
          aria-label="Sync status"
          title={syncState?.lastSyncAt ? `Synced ${formatRelative(syncState.lastSyncAt)}` : 'Checking sync status…'}
          style={{ textDecoration: 'none', position: 'relative' }}
        >
          <IconCloud width={18} height={18} />
          <span
            className={`shell-topbar__status-dot ${(syncState?.pendingLocal ?? 0) > 0 ? 'shell-topbar__status-dot--syncing' : ''}`}
            aria-hidden="true"
            style={{ position: 'absolute', bottom: 8, right: 8 }}
          />
        </Link>

        <button
          type="button"
          className="shell-topbar__action-btn"
          onClick={() => navigate('/settings/providers')}
          aria-label="AI providers &amp; models"
          title="AI providers &amp; models"
        >
          <IconProviders width={18} height={18} />
        </button>

        <button
          type="button"
          className={`shell-topbar__action-btn ${agentRailOpen ? 'is-active' : ''}`}
          onClick={onToggleAgentRail}
          aria-pressed={agentRailOpen}
          aria-label="Toggle agent panel"
          title="Agents panel"
        >
          <IconProviders width={18} height={18} />
        </button>

        <button
          type="button"
          className="shell-topbar__action-btn"
          onClick={onOpenNotifications}
          aria-haspopup="dialog"
          aria-label={unread ? `${unread} unread notifications` : 'Notifications'}
          title={unread ? `${unread} unread` : 'Notifications'}
          style={{ position: 'relative' }}
        >
          <IconBell width={18} height={18} />
          {unread > 0 && <span className="shell-topbar__action-dot" aria-hidden="true" />}
        </button>

        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className="shell-topbar__action-btn"
            aria-haspopup="menu"
            aria-expanded={userMenuOpen}
            aria-label={`Account: ${user?.displayName ?? user?.name ?? 'User'}`}
            style={{ padding: 2, borderRadius: 'var(--radius-full)', width: 36, height: 36 }}
            onClick={() => setUserMenuOpen((v) => !v)}
            onBlur={() => setTimeout(() => setUserMenuOpen(false), 150)}
          >
            <span
              aria-hidden="true"
              style={{
                width: 32, height: 32, borderRadius: 'var(--radius-full)',
                background: 'linear-gradient(135deg, var(--color-primary-500), var(--color-accent-rose))',
                color: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 600, fontSize: 13,
              }}
            >
              {(user?.displayName ?? user?.name ?? 'U').slice(0, 1)}
            </span>
          </button>
          {userMenuOpen && (
            <div
              className="panel panel--notif"
              style={{ width: 280, top: 48, right: 0, left: 'auto', bottom: 'auto' }}
              onMouseDown={(e) => e.preventDefault()}
            >
              <div style={{ padding: 'var(--space-4) var(--space-5)', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>
                  {user?.displayName ?? user?.name ?? 'Guest'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
                  {user?.email ?? 'Sign in to sync across devices'}
                </div>
              </div>
              <div className="panel__body">
                <ul role="list" style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                  <li>
                    <button
                      type="button"
                      className="cmd-item"
                      style={{ width: '100%', textAlign: 'left', border: 'none', background: 'transparent', borderRadius: 'var(--radius-sm)' }}
                      onClick={() => { navigate('/settings'); setUserMenuOpen(false); }}
                    >
                      <div className="cmd-item__icon"><IconSettings width={16} height={16} /></div>
                      <div className="cmd-item__text"><div className="cmd-item__title">Settings</div></div>
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      className="cmd-item"
                      style={{ width: '100%', textAlign: 'left', border: 'none', background: 'transparent', borderRadius: 'var(--radius-sm)' }}
                      onClick={() => { navigate('/settings/providers'); setUserMenuOpen(false); }}
                    >
                      <div className="cmd-item__icon"><IconProviders width={16} height={16} /></div>
                      <div className="cmd-item__text"><div className="cmd-item__title">AI providers</div></div>
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      className="cmd-item"
                      style={{ width: '100%', textAlign: 'left', border: 'none', background: 'transparent', borderRadius: 'var(--radius-sm)' }}
                      onClick={() => { onOpenCommandPalette(); setUserMenuOpen(false); }}
                    >
                      <div className="cmd-item__icon"><IconCommand width={16} height={16} /></div>
                      <div className="cmd-item__text"><div className="cmd-item__title">Command palette</div></div>
                      <span className="cmd-item__kbd">⌘⇧P</span>
                    </button>
                  </li>
                </ul>
              </div>
              <div className="panel__footer">
                <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Syntrophos v0.1.0</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function buildCrumbs(pathname: string): readonly { readonly label: string; readonly to: string }[] {
  const map: Record<string, string> = {
    '': 'Home',
    chat: 'Chat',
    notes: 'Notes',
    tasks: 'Tasks',
    calendar: 'Calendar',
    agents: 'Agents',
    voice: 'Voice',
    integrations: 'Integrations',
    plugins: 'Plugins',
    workspaces: 'Workspaces',
    settings: 'Settings',
    starred: 'Starred',
  };
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length === 0) return [{ label: 'Dashboard', to: '/' }];
  const crumbs: Array<{ label: string; to: string }> = [{ label: 'Home', to: '/' }];
  let path = '';
  for (const part of parts) {
    path = `${path}/${part}`;
    const clean = part.replaceAll('-', ' ');
    crumbs.push({
      label: map[part] ?? clean.charAt(0).toUpperCase() + clean.slice(1),
      to: path,
    });
  }
  return crumbs;
}

function formatRelative(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.max(1, Math.round(ms / 60000));
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}
