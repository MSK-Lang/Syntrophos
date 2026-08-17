import { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  IconBell,
  IconChevronDown,
  IconCommand,
  IconMenu,
  IconMic,
  IconPlus,
  IconSearch,
  IconSettings,
  IconProviders,
  IconWorkspace,
  IconCheckCircle,
  IconX,
  IconBot,
  IconCalendar,
  IconNotes,
  IconTasks,
} from '@/lib/icons.js';
import { useAuth, useNotifications, useWorkspace, useTasks, useNotes } from '@/lib/services/index.js';
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
  const { currentWorkspace, switchTo } = useWorkspace();
  const { resolvedTheme, toggleTheme } = useTheme();
  const { getUnreadCount } = useNotifications();
  const { createTask } = useTasks();
  const { create: createNote } = useNotes();

  const [unread, setUnread] = useState(3);
  const [wsMenuOpen, setWsMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [attentionOpen, setAttentionOpen] = useState(false);
  const [quickCaptureOpen, setQuickCaptureOpen] = useState(false);

  // Quick Capture State
  const [captureType, setCaptureType] = useState<'task' | 'note' | 'idea' | 'reminder'>('task');
  const [captureTitle, setCaptureTitle] = useState('');

  // Attention Items
  const [attentionItems, setAttentionItems] = useState([
    { id: 'att-1', title: 'Approve proposed action: Schedule Q3 Review', type: 'approval', source: 'Syntrophos Agent' },
    { id: 'att-2', title: 'Calendar conflict: 03:00 PM Team Sync', type: 'calendar', source: 'Calendar' },
    { id: 'att-3', title: 'Agent completed task: Research: Retrieval Evaluation', type: 'agent', source: 'Researcher' },
  ]);

  useEffect(() => {
    void (async () => {
      try {
        const count = await getUnreadCount();
        setUnread(count > 0 ? count : 3);
      } catch {
        /* ignore */
      }
    })();
  }, [getUnreadCount]);

  const crumbs = buildCrumbs(location.pathname);

  const handleQuickCaptureSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captureTitle.trim()) return;
    try {
      if (captureType === 'task' || captureType === 'reminder') {
        await createTask?.({ title: captureTitle.trim(), priority: 'high', status: 'todo' });
      } else {
        await createNote?.({
          title: captureTitle.trim(),
          path: `quick-${Date.now()}.md`,
          content: `# ${captureTitle.trim()}\n\nCaptured from Topbar.`,
        });
      }
      setCaptureTitle('');
      setQuickCaptureOpen(false);
    } catch {
      setQuickCaptureOpen(false);
    }
  };

  const dismissAttentionItem = (id: string) => {
    setAttentionItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <header className="shell-topbar" role="banner" style={{ background: '#040200', borderBottom: '1px solid rgba(255, 170, 48, 0.25)', fontFamily: 'var(--font-sans)' }}>
      {/* LEFT: Breadcrumb & Sidebar Toggle */}
      <div className="shell-topbar__crumbs" aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          type="button"
          className="shell-topbar__toggle ui-btn ui-btn--ghost ui-btn--icon"
          aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          onClick={onToggleSidebar}
          style={{ color: '#ffaa30' }}
        >
          <IconMenu width={18} height={18} />
        </button>
        <nav aria-label="You are here">
          <ol role="list" style={{ display: 'flex', alignItems: 'center', gap: 8, listStyle: 'none', padding: 0, margin: 0, fontSize: 13, fontFamily: 'var(--font-sans)', fontWeight: 500 }}>
            {crumbs.map((crumb, i) => (
              <li key={crumb.to} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                {i > 0 && (
                  <span style={{ color: '#885522', fontSize: 10 }}>/</span>
                )}
                {i === crumbs.length - 1 ? (
                  <span style={{ color: '#ffcc66', fontWeight: 600 }}>{crumb.label}</span>
                ) : (
                  <Link to={crumb.to} style={{ color: '#d99a4e', textDecoration: 'none' }}>
                    {crumb.label}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>
      </div>

      {/* CENTER: Universal Search & Command Surface */}
      <div className="shell-topbar__search" style={{ flex: '1 1 auto', maxWidth: 540, margin: '0 20px' }}>
        <button
          type="button"
          className="shell-topbar__search-btn"
          onClick={onOpenSearch}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(20, 10, 2, 0.8)',
            border: '1px solid rgba(255, 170, 48, 0.3)',
            borderRadius: 6,
            padding: '6px 12px',
            color: '#d99a4e',
            fontSize: 12,
            fontFamily: 'var(--font-sans)',
            cursor: 'pointer',
            transition: 'all 140ms ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <IconSearch width={14} height={14} style={{ color: '#ffaa30' }} />
            <span>Search or ask Syntrophos... (tasks, notes, chats, calendar, agents…)</span>
          </div>
          <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', background: 'rgba(255, 170, 48, 0.15)', border: '1px solid rgba(255, 170, 48, 0.3)', padding: '1px 6px', borderRadius: 4, color: '#ffcc66' }}>
            ⌘K
          </span>
        </button>
      </div>

      {/* RIGHT: Operating Actions */}
      <div className="shell-topbar__actions" style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative' }}>
        {/* Workspace Switcher */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className="shell-topbar__workspace"
            onClick={() => setWsMenuOpen((v) => !v)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(20, 10, 2, 0.8)',
              border: '1px solid rgba(255, 170, 48, 0.3)',
              borderRadius: 6,
              padding: '5px 10px',
              color: '#ffcc66',
              fontSize: 11,
              fontFamily: 'var(--font-sans)',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <IconWorkspace width={13} height={13} style={{ color: '#ffaa30' }} />
            <span>{currentWorkspace.status === 'success' ? currentWorkspace.data.settings.name : 'Personal'}</span>
            <IconChevronDown width={12} height={12} style={{ color: '#885522' }} />
          </button>

          {wsMenuOpen && (
            <div
              style={{
                position: 'absolute',
                top: 40,
                right: 0,
                width: 220,
                background: '#080401',
                border: '1px solid rgba(255, 170, 48, 0.4)',
                borderRadius: 6,
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.9)',
                padding: 8,
                zIndex: 100,
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                fontFamily: 'var(--font-sans)',
              }}
            >
              <div style={{ fontSize: 9, color: '#885522', fontFamily: 'var(--font-mono)', padding: '4px 8px', letterSpacing: '0.1em' }}>
                SWITCH WORKSPACE
              </div>
              <button
                type="button"
                onClick={() => { void switchTo('ws-personal'); setWsMenuOpen(false); }}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(255, 170, 48, 0.15)', border: 'none', color: '#ffcc66', fontSize: 12, cursor: 'pointer', textAlign: 'left' }}
              >
                <span>●</span> Personal Workspace
              </button>
              <button
                type="button"
                onClick={() => { void switchTo('ws-business'); setWsMenuOpen(false); }}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 4, background: 'transparent', border: 'none', color: '#d99a4e', fontSize: 12, cursor: 'pointer', textAlign: 'left' }}
              >
                <span>○</span> Business Workspace
              </button>
            </div>
          )}
        </div>

        {/* Voice Mic Button */}
        <button
          type="button"
          onClick={onOpenVoice}
          title="Voice Mode"
          style={{
            width: 32,
            height: 32,
            borderRadius: 6,
            background: 'rgba(20, 10, 2, 0.8)',
            border: '1px solid rgba(255, 170, 48, 0.3)',
            color: '#ffaa30',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <IconMic width={15} height={15} />
        </button>

        {/* Quick Capture Trigger */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setQuickCaptureOpen((v) => !v)}
            title="Quick Capture (Task, Note, Idea)"
            style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              background: quickCaptureOpen ? '#ffaa30' : 'rgba(20, 10, 2, 0.8)',
              border: '1px solid rgba(255, 170, 48, 0.4)',
              color: quickCaptureOpen ? '#000000' : '#ffaa30',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            <IconPlus width={16} height={16} />
          </button>

          {/* Quick Capture Popover */}
          {quickCaptureOpen && (
            <div
              style={{
                position: 'absolute',
                top: 40,
                right: 0,
                width: 320,
                background: '#080401',
                border: '1px solid rgba(255, 170, 48, 0.4)',
                borderRadius: 8,
                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.9)',
                padding: 16,
                zIndex: 110,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                fontFamily: 'var(--font-sans)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 11, fontWeight: 'bold', color: '#ffaa30', letterSpacing: '0.12em', fontFamily: 'var(--font-mono)' }}>
                  QUICK CAPTURE
                </div>
                <button type="button" onClick={() => setQuickCaptureOpen(false)} style={{ background: 'transparent', border: 'none', color: '#885522', cursor: 'pointer' }}>
                  <IconX width={14} height={14} />
                </button>
              </div>

              {/* Type Pills */}
              <div style={{ display: 'flex', gap: 4, background: 'rgba(20, 10, 2, 0.8)', padding: 3, borderRadius: 4 }}>
                {(['task', 'note', 'idea', 'reminder'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setCaptureType(t)}
                    style={{
                      flex: 1,
                      background: captureType === t ? '#ffaa30' : 'transparent',
                      color: captureType === t ? '#000000' : '#d99a4e',
                      border: 'none',
                      borderRadius: 3,
                      padding: '4px 0',
                      fontSize: 10,
                      fontWeight: 'bold',
                      fontFamily: 'var(--font-mono)',
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <form onSubmit={handleQuickCaptureSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <input
                  type="text"
                  value={captureTitle}
                  onChange={(e) => setCaptureTitle(e.target.value)}
                  placeholder={`Type ${captureType} title or directive…`}
                  autoFocus
                  style={{
                    width: '100%',
                    background: 'rgba(20, 10, 2, 0.8)',
                    border: '1px solid rgba(255, 170, 48, 0.3)',
                    borderRadius: 4,
                    padding: '8px 10px',
                    color: '#ffcc66',
                    fontSize: 12,
                    fontFamily: 'var(--font-sans)',
                    outline: 'none',
                  }}
                />
                <button
                  type="submit"
                  style={{
                    background: '#ffaa30',
                    border: 'none',
                    borderRadius: 4,
                    color: '#000000',
                    fontWeight: 'bold',
                    padding: '6px',
                    fontSize: 11,
                    fontFamily: 'var(--font-mono)',
                    cursor: 'pointer',
                  }}
                >
                  [ CAPTURE {captureType.toUpperCase()} ]
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Attention / Notifications Bell */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setAttentionOpen((v) => !v)}
            title="Attention & Notifications"
            style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              background: attentionOpen ? 'rgba(255, 170, 48, 0.2)' : 'rgba(20, 10, 2, 0.8)',
              border: '1px solid rgba(255, 170, 48, 0.3)',
              color: '#ffaa30',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              position: 'relative',
            }}
          >
            <IconBell width={15} height={15} />
            {attentionItems.length > 0 && (
              <span style={{ position: 'absolute', top: 6, right: 6, width: 6, height: 6, borderRadius: '50%', background: '#ffaa30', boxShadow: '0 0 6px #ffaa30' }} />
            )}
          </button>

          {/* Attention Center Popover */}
          {attentionOpen && (
            <div
              style={{
                position: 'absolute',
                top: 40,
                right: 0,
                width: 340,
                background: '#080401',
                border: '1px solid rgba(255, 170, 48, 0.4)',
                borderRadius: 8,
                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.9)',
                padding: 16,
                zIndex: 110,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                fontFamily: 'var(--font-sans)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 11, fontWeight: 'bold', color: '#ffaa30', letterSpacing: '0.12em', fontFamily: 'var(--font-mono)' }}>
                  ATTENTION CENTER ({attentionItems.length})
                </div>
                <button type="button" onClick={() => setAttentionOpen(false)} style={{ background: 'transparent', border: 'none', color: '#885522', cursor: 'pointer' }}>
                  <IconX width={14} height={14} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {attentionItems.length === 0 ? (
                  <div style={{ fontSize: 12, color: '#885522', fontFamily: 'var(--font-mono)', padding: '12px 0', textAlign: 'center' }}>
                    ALL ATTENTION ITEMS RESOLVED
                  </div>
                ) : (
                  attentionItems.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        padding: '10px',
                        background: 'rgba(20, 10, 2, 0.7)',
                        border: '1px solid rgba(255, 170, 48, 0.2)',
                        borderRadius: 6,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 6,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 9, color: '#ffaa30', fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>
                          [{item.source.toUpperCase()}]
                        </span>
                        <button
                          type="button"
                          onClick={() => dismissAttentionItem(item.id)}
                          style={{ background: 'transparent', border: 'none', color: '#885522', fontSize: 10, cursor: 'pointer' }}
                        >
                          ✕ DISMISS
                        </button>
                      </div>
                      <div style={{ fontSize: 12, color: '#ffcc66', lineHeight: 1.4 }}>{item.title}</div>
                      <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
                        <button
                          type="button"
                          onClick={() => dismissAttentionItem(item.id)}
                          style={{
                            background: '#ffaa30',
                            color: '#000000',
                            border: 'none',
                            borderRadius: 3,
                            padding: '3px 8px',
                            fontSize: 10,
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                          }}
                        >
                          [ APPROVE ]
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar Menu */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className="shell-topbar__action-btn"
            onClick={() => setUserMenuOpen((v) => !v)}
            style={{ padding: 2, borderRadius: '50%', width: 32, height: 32, border: 'none', background: 'transparent', cursor: 'pointer' }}
          >
            <span
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #ffaa30, #cc7800)',
                color: '#000000',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: 12,
                fontFamily: 'var(--font-sans)',
              }}
            >
              {(user?.displayName ?? user?.name ?? 'O').slice(0, 1)}
            </span>
          </button>

          {userMenuOpen && (
            <div
              style={{
                position: 'absolute',
                top: 40,
                right: 0,
                width: 220,
                background: '#080401',
                border: '1px solid rgba(255, 170, 48, 0.4)',
                borderRadius: 8,
                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.9)',
                padding: 12,
                zIndex: 110,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                fontFamily: 'var(--font-sans)',
              }}
            >
              <div style={{ paddingBottom: 6, borderBottom: '1px solid rgba(255, 170, 48, 0.2)' }}>
                <div style={{ fontSize: 13, fontWeight: 'bold', color: '#ffcc66' }}>{user?.displayName ?? user?.name ?? 'Operator'}</div>
                <div style={{ fontSize: 10, color: '#885522', fontFamily: 'var(--font-mono)' }}>OPERATOR // ACTIVE</div>
              </div>
              <button
                type="button"
                onClick={() => { navigate('/settings'); setUserMenuOpen(false); }}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', background: 'transparent', border: 'none', color: '#d99a4e', fontSize: 12, cursor: 'pointer', textAlign: 'left' }}
              >
                <IconSettings width={14} height={14} /> Settings
              </button>
              <button
                type="button"
                onClick={() => { onOpenCommandPalette(); setUserMenuOpen(false); }}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', background: 'transparent', border: 'none', color: '#d99a4e', fontSize: 12, cursor: 'pointer', textAlign: 'left' }}
              >
                <IconCommand width={14} height={14} /> Command Palette (⌘K)
              </button>
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
    settings: 'Settings',
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
