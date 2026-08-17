import { useEffect, useMemo, useRef, useState, type Fragment as _F, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  IconAlertCircle,
  IconBot,
  IconCalendar,
  IconChat,
  IconChevronRight,
  IconCommand,
  IconDashboard,
  IconIntegration,
  IconNotes,
  IconPlugin,
  IconProviders,
  IconRefresh,
  IconSearch,
  IconSettings,
  IconStar,
  IconTasks,
  IconWorkspace,
  IconX,
  IconMail,
  IconFolder,
  IconGraph,
  IconCheckCircle,
} from '@/lib/icons.jsx';
import {
  Avatar,
  Badge,
  Button,
  Input,
  Separator,
} from '@/components/ui/primitives.js';
import { EmptySearch, PageLoader } from '@/components/ui/states.js';
import { useNotifications, useSearch, useAgents, useWorkspace } from '@/lib/services/index.js';
import type { Notification, NotificationCategory, NotificationOrigin } from '@/lib/services/notifications.contract.js';
import type { SearchResultItemType } from '@/lib/services/search.contract.js';
import type { Agent, AgentRun } from '@/lib/services/agents.contract.js';
import type { WorkspaceMember } from '@/lib/services/workspace.contract.js';

/* ─────────────────────────────────────────────────────────────────────────────
 *  NOTIFICATION PANEL
 * ──────────────────────────────────────────────────────────────────────────── */

export function NotificationPanel({
  open,
  onClose,
}: {
  readonly open: boolean;
  readonly onClose: () => void;
}) {
  const { list, markAllRead, markRead } = useNotifications();
  const [items, setItems] = useState<Notification[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    void (async () => {
      try {
        const r = await list({ pageSize: 50 });
        setItems(r.items as unknown as Notification[]);
      } finally {
        setLoading(false);
      }
    })();
  }, [open, list]);

  if (!open) return null;

  const unreadCount = items?.filter((n) => !n.readAt).length ?? 0;

  return (
    <>
      <div className="panel-scrim" onClick={onClose} />
      <div className="panel panel--notif" role="dialog" aria-modal="true" aria-label="Notifications">
        <div className="panel__head">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <h3 className="panel__title">Notifications</h3>
            {unreadCount > 0 && <Badge tone="primary" size="sm">{unreadCount} unread</Badge>}
          </div>
          <div style={{ display: 'inline-flex', gap: 'var(--space-2)' }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                void (async () => {
                  await markAllRead();
                  setItems((curr) => (curr ?? []).map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })));
                })();
              }}
            >
              Mark all read
            </Button>
            <button
              type="button"
              className="ui-btn ui-btn--ghost ui-btn--icon"
              onClick={onClose}
              aria-label="Close"
              style={{ width: 32, height: 32 }}
            >
              <IconX width={16} height={16} />
            </button>
          </div>
        </div>

        <div style={{ padding: '0 var(--space-5)', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ display: 'inline-flex', padding: 'var(--space-2)', background: 'var(--color-background-muted)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', marginTop: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
            {(['all', 'unread'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`ui-btn ui-btn--${tab === t ? 'secondary' : 'ghost'} ui-btn--sm`}
                style={{ border: 'none', boxShadow: tab === t ? 'var(--shadow-xs)' : 'none', background: tab === t ? 'var(--color-background-elevated)' : 'transparent' }}
              >
                {t === 'all' ? 'All' : 'Unread'}
              </button>
            ))}
          </div>
        </div>

        <div className="panel__body">
          {loading ? (
            <PageLoader label="Loading notifications…" />
          ) : items && items.filter((n) => tab === 'all' || !n.readAt).length > 0 ? (
            <ul role="list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {items
                .filter((n) => tab === 'all' || !n.readAt)
                .map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      className={`notif-item ${!n.readAt ? 'notif-item--unread' : ''}`}
                      style={{ width: '100%', textAlign: 'left', border: 'none', background: 'transparent' }}
                      onClick={() => {
                        void markRead(n.id);
                        setItems((curr) => (curr ?? []).map((x) => (x.id === n.id ? { ...x, readAt: new Date().toISOString() } : x)));
                        onClose();
                      }}
                    >
                      <NotificationIcon origin={n.origin} category={n.category} />
                      <div className="notif-item__body">
                        <div className="notif-item__title">{n.title}</div>
                        <div className="notif-item__body-text">{n.body}</div>
                        <div className="notif-item__time">{formatRelative(n.deliveredAt)}</div>
                      </div>
                    </button>
                  </li>
                ))}
            </ul>
          ) : (
            <div style={{ padding: 'var(--space-8) var(--space-5)' }}>
              <EmptySearch query="" />
            </div>
          )}
        </div>

        <div className="panel__footer">
          <span>Showing notifications from the last 30 days.</span>
          <Link to="/settings/notifications" style={{ textDecoration: 'none', fontSize: 12 }}>Manage preferences</Link>
        </div>
      </div>
    </>
  );
}

const ORIGIN_ICONS: Record<NotificationOrigin, ReactNode> = {
  chat: <IconChat width={16} height={16} />,
  tasks: <IconTasks width={16} height={16} />,
  notes: <IconNotes width={16} height={16} />,
  sync: <IconRefresh width={16} height={16} />,
  agent: <IconBot width={16} height={16} />,
  workspace: <IconWorkspace width={16} height={16} />,
  system: <IconAlertCircle width={16} height={16} />,
  integration: <IconIntegration width={16} height={16} />,
};

function NotificationIcon({ origin, category }: { readonly origin: NotificationOrigin; readonly category: NotificationCategory }) {
  const icon = ORIGIN_ICONS[origin];
  const toneClass = `notif-item__icon--${category === 'mention' ? 'mention' : category}`;
  return <div className={`notif-item__icon ${toneClass}`}>{icon}</div>;
}

/* ─────────────────────────────────────────────────────────────────────────────
 *  COMMAND PALETTE
 * ──────────────────────────────────────────────────────────────────────────── */

type Command = {
  readonly id: string;
  readonly group: string;
  readonly title: string;
  readonly hint?: string;
  readonly icon: ReactNode;
  readonly shortcut?: string;
  readonly tag?: string;
  readonly run: () => void;
};

export function CommandPalette({
  open,
  onClose,
}: {
  readonly open: boolean;
  readonly onClose: () => void;
}) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const isMac = typeof window !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  const kbdShortcut = isMac ? '⌘ K' : 'Ctrl K';

  // Base Commands (Empty Query View)
  const defaultCommands = useMemo<Command[]>(() => [
    // ASK
    {
      id: 'ask-syntrophos',
      group: 'ASK',
      title: 'Ask Syntrophos',
      hint: 'Ask about your workspace, tasks, notes, or knowledge graph',
      icon: <IconBot width={16} height={16} style={{ color: '#ffaa30' }} />,
      shortcut: '↵',
      run: () => navigate('/chat/new'),
    },
    // GO TO
    { id: 'go-dashboard', group: 'GO TO', title: 'Dashboard', icon: <IconDashboard width={16} height={16} />, run: () => navigate('/dashboard') },
    { id: 'go-inbox', group: 'GO TO', title: 'Inbox', icon: <IconMail width={16} height={16} />, run: () => navigate('/inbox') },
    { id: 'go-tasks', group: 'GO TO', title: 'Tasks', icon: <IconTasks width={16} height={16} />, run: () => navigate('/tasks') },
    { id: 'go-projects', group: 'GO TO', title: 'Projects', icon: <IconFolder width={16} height={16} />, run: () => navigate('/projects') },
    { id: 'go-calendar', group: 'GO TO', title: 'People & Schedule', icon: <IconCalendar width={16} height={16} />, run: () => navigate('/calendar') },
    { id: 'go-intelligence', group: 'GO TO', title: 'Intelligence', icon: <IconBot width={16} height={16} />, run: () => navigate('/intelligence') },
    { id: 'go-knowledge', group: 'GO TO', title: 'Knowledge', icon: <IconGraph width={16} height={16} />, run: () => navigate('/knowledge') },
    { id: 'go-settings', group: 'GO TO', title: 'Settings', icon: <IconSettings width={16} height={16} />, run: () => navigate('/settings') },
    { id: 'go-help', group: 'GO TO', title: 'Help & Guide', icon: <IconCheckCircle width={16} height={16} />, run: () => navigate('/help') },

    // CREATE
    { id: 'create-task', group: 'CREATE', title: 'New task', hint: 'Create a new action item', icon: <IconTasks width={16} height={16} />, shortcut: 'T', run: () => navigate('/tasks?new=1') },
    { id: 'create-note', group: 'CREATE', title: 'New note', hint: 'Create a new markdown note', icon: <IconNotes width={16} height={16} />, shortcut: 'N', run: () => navigate('/notes/new') },
    { id: 'create-project', group: 'CREATE', title: 'New project', hint: 'Create a new project workspace', icon: <IconFolder width={16} height={16} />, run: () => navigate('/projects?new=1') },
    { id: 'create-workflow', group: 'CREATE', title: 'New workflow', hint: 'Create an automated workflow', icon: <IconBot width={16} height={16} />, run: () => navigate('/workflows?new=1') },

    // RECENT
    { id: 'recent-project', group: 'RECENT', title: 'Syntrophos Launch', hint: 'Project · 12 tasks active', icon: <IconFolder width={16} height={16} />, tag: 'PROJECT', run: () => navigate('/projects') },
    { id: 'recent-person', group: 'RECENT', title: 'Sarah Chen', hint: 'Person · Helio Labs Architect', icon: <IconCalendar width={16} height={16} />, tag: 'PERSON', run: () => navigate('/calendar') },
    { id: 'recent-task', group: 'RECENT', title: 'Today’s Tasks', hint: 'Task · 5 active tasks', icon: <IconTasks width={16} height={16} />, tag: 'TASK', run: () => navigate('/tasks') },
    { id: 'recent-agent', group: 'RECENT', title: 'Planner Agent', hint: 'Agent · Intelligence System', icon: <IconBot width={16} height={16} />, tag: 'AGENT', run: () => navigate('/intelligence') },
  ], [navigate]);

  // Extended Search Items (When Query Exists)
  const searchDatabase = useMemo<Command[]>(() => [
    ...defaultCommands,
    { id: 'search-task-1', group: 'SEARCH RESULTS', title: 'Prepare launch presentation', hint: 'Due today · High priority', icon: <IconTasks width={16} height={16} />, tag: 'TASK', run: () => navigate('/tasks') },
    { id: 'search-task-2', group: 'SEARCH RESULTS', title: 'Design 3D spatial orb shaders', hint: 'Completed · Core Engine', icon: <IconTasks width={16} height={16} />, tag: 'TASK', run: () => navigate('/tasks') },
    { id: 'search-note-1', group: 'SEARCH RESULTS', title: 'Q3 Product Architecture.md', hint: 'Knowledge base architecture doc', icon: <IconNotes width={16} height={16} />, tag: 'NOTE', run: () => navigate('/notes') },
    { id: 'search-note-2', group: 'SEARCH RESULTS', title: 'Weekly Core Engine Review.md', hint: 'Team notes · 2 days ago', icon: <IconNotes width={16} height={16} />, tag: 'NOTE', run: () => navigate('/notes') },
    { id: 'search-agent-1', group: 'SEARCH RESULTS', title: 'Researcher Agent', hint: 'Retrieval & synthesis specialist', icon: <IconBot width={16} height={16} />, tag: 'AGENT', run: () => navigate('/intelligence') },
    { id: 'search-workflow-1', group: 'SEARCH RESULTS', title: 'Automated Client Onboarding', hint: 'Active workflow · 4 steps', icon: <IconBot width={16} height={16} />, tag: 'WORKFLOW', run: () => navigate('/workflows') },
    { id: 'search-knowledge-1', group: 'SEARCH RESULTS', title: 'Provenance Telemetry Vault', hint: 'Knowledge graph source data', icon: <IconGraph width={16} height={16} />, tag: 'KNOWLEDGE', run: () => navigate('/knowledge') },
  ], [defaultCommands, navigate]);

  const filtered = useMemo(() => {
    if (!query.trim()) return defaultCommands;
    const q = query.toLowerCase().trim();
    return searchDatabase.filter((c) =>
      c.title.toLowerCase().includes(q) ||
      c.group.toLowerCase().includes(q) ||
      (c.hint && c.hint.toLowerCase().includes(q)) ||
      (c.tag && c.tag.toLowerCase().includes(q))
    );
  }, [defaultCommands, searchDatabase, query]);

  useEffect(() => {
    setActiveIdx(0);
  }, [query]);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 0);
      return () => clearTimeout(t);
    }
    return;
  }, [open]);

  if (!open) return null;

  const onKey = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx((i) => Math.min(filtered.length - 1, i + 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx((i) => Math.max(0, i - 1)); }
    if (e.key === 'Enter') {
      e.preventDefault();
      const c = filtered[activeIdx];
      if (c) { c.run(); onClose(); }
    }
  };

  // Group items by category preserves ASK, GO TO, CREATE, RECENT order
  const groupOrder = ['ASK', 'GO TO', 'CREATE', 'RECENT', 'SEARCH RESULTS'];
  const grouped = groupOrder.map((g) => ({
    group: g,
    items: filtered.filter((item) => item.group === g),
  })).filter((g) => g.items.length > 0);

  return (
    <>
      <div className="panel-scrim" onClick={onClose} style={{ zIndex: 120 }} />
      <div
        className="panel panel--command"
        style={{ zIndex: 121, maxWidth: 640, width: '92vw' }}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
      >
        {/* INPUT HEADER */}
        <div className="cmd-input-wrap" style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255, 170, 48, 0.2)' }}>
          <IconSearch width={18} height={18} style={{ color: '#ffaa30' }} />
          <input
            ref={inputRef}
            className="cmd-input"
            placeholder="Search Syntrophos..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKey}
            aria-label="Search or ask Syntrophos"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            style={{ fontSize: 14, color: '#fff5e6' }}
          />
          <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', background: 'rgba(255, 170, 48, 0.15)', border: '1px solid rgba(255, 170, 48, 0.3)', padding: '2px 6px', borderRadius: 4, color: '#ffcc66' }}>
            {kbdShortcut}
          </span>
        </div>

        {/* RESULTS BODY */}
        <div className="panel__body" style={{ padding: '12px 16px', maxHeight: 440, overflowY: 'auto' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '36px 20px', textAlign: 'center', color: '#d99a4e', display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 'bold', color: '#fff5e6' }}>NO RESULTS FOUND</div>
              <div style={{ fontSize: 13, color: '#885522' }}>Try another search query or ask Syntrophos directly.</div>
              <button
                type="button"
                onClick={() => { navigate('/chat/new'); onClose(); }}
                className="public-btn-tactile"
                style={{ marginTop: 8, padding: '8px 16px', background: 'rgba(255, 170, 48, 0.15)', border: '1px solid rgba(255, 170, 48, 0.3)', borderRadius: 4, color: '#ffaa30', fontSize: 12, fontFamily: 'var(--font-mono)', cursor: 'pointer' }}
              >
                Ask Syntrophos in Chat &rarr;
              </button>
            </div>
          ) : (
            grouped.map(({ group, items }) => (
              <div key={group} style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10, color: '#885522', fontWeight: 'bold', fontFamily: 'var(--font-mono)', letterSpacing: '0.14em', marginBottom: 8, paddingLeft: 8 }}>
                  {group}
                </div>

                {items.map((c) => {
                  const globalIdx = filtered.indexOf(c);
                  const isActive = globalIdx === activeIdx;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      className="cmd-item"
                      data-active={isActive || undefined}
                      role="option"
                      aria-selected={isActive}
                      onMouseEnter={() => setActiveIdx(globalIdx)}
                      onClick={() => { c.run(); onClose(); }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        borderRadius: 6,
                        background: isActive ? 'rgba(255, 170, 48, 0.15)' : 'transparent',
                        border: isActive ? '1px solid rgba(255, 170, 48, 0.4)' : '1px solid transparent',
                        color: '#fff5e6',
                        cursor: 'pointer',
                        textAlign: 'left',
                        marginBottom: 2,
                        transition: 'all 120ms ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                        <div style={{ color: isActive ? '#ffaa30' : '#d99a4e', display: 'flex', alignItems: 'center' }}>
                          {c.icon}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: isActive ? 700 : 500, color: isActive ? '#fff5e6' : '#e6d0b3' }}>
                            {c.title}
                          </div>
                          {c.hint && (
                            <div style={{ fontSize: 11, color: '#885522', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {c.hint}
                            </div>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {c.tag && (
                          <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', fontWeight: 'bold', background: 'rgba(255, 170, 48, 0.12)', color: '#ffaa30', padding: '2px 6px', borderRadius: 3, letterSpacing: '0.08em' }}>
                            {c.tag}
                          </span>
                        )}
                        {c.shortcut && (
                          <span className="cmd-item__kbd" style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: '#885522' }}>
                            {c.shortcut}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* FOOTER SHORTCUTS */}
        <div className="panel__footer" style={{ padding: '10px 18px', borderTop: '1px solid rgba(255, 170, 48, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, fontFamily: 'var(--font-mono)', color: '#885522' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span><strong style={{ color: '#ffcc66' }}>↑↓</strong> navigate</span>
            <span><strong style={{ color: '#ffcc66' }}>↵</strong> select</span>
            <span><strong style={{ color: '#ffcc66' }}>esc</strong> close</span>
          </div>
          <span style={{ color: '#ffaa30' }}>SYNTHROPHOS COMMAND</span>
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 *  GLOBAL SEARCH DIALOG
 * ──────────────────────────────────────────────────────────────────────────── */

export function GlobalSearch({
  open,
  onClose,
}: {
  readonly open: boolean;
  readonly onClose: () => void;
}) {
  const { query } = useSearch();
  const [q, setQ] = useState('');
  const [results, setResults] = useState<{
    readonly items: readonly { readonly id: string; readonly type: SearchResultItemType; readonly title: string; readonly snippet: string; readonly path?: string; readonly url: string }[];
    readonly total: number;
    readonly latencyMs: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 0);
      return () => clearTimeout(t);
    }
    return;
  }, [open]);

  useEffect(() => {
    if (!open || !q.trim()) { setResults(null); return; }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const r = await query(q.trim(), { limit: 20, semantic: true });
        setResults(r);
      } finally { setLoading(false); }
    }, 150);
    return () => clearTimeout(t);
  }, [open, q, query]);

  if (!open) return null;

  return (
    <div className="panel-scrim" onClick={onClose} style={{ zIndex: 110 }}>
      <div className="panel panel--command" style={{ zIndex: 111 }} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Global search">
        <div className="cmd-input-wrap">
          <IconSearch width={18} height={18} style={{ color: 'var(--color-text-muted)' }} />
          <input
            ref={inputRef}
            className="cmd-input"
            placeholder="Search notes, tasks, projects, conversations, files…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}
            aria-label="Search workspace"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
          />
          <button
            type="button"
            className="ui-btn ui-btn--ghost ui-btn--icon"
            onClick={onClose}
            aria-label="Close search"
            style={{ width: 30, height: 30 }}
          >
            <IconX width={16} height={16} />
          </button>
        </div>

        <div className="panel__body" style={{ padding: 0 }}>
          <div style={{ maxHeight: 420, overflowY: 'auto', padding: 'var(--space-3)' }}>
            {loading ? (
              <PageLoader label="Searching your memory…" />
            ) : !q.trim() ? (
              <div style={{ padding: 'var(--space-5)' }}>
                <EmptySearch query="" />
              </div>
            ) : results && results.items.length > 0 ? (
              results.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => { navigate(item.url); onClose(); }}
                  className="cmd-item"
                  style={{ borderRadius: 'var(--radius-md)', textAlign: 'left', border: 'none', background: 'transparent', width: '100%' }}
                >
                  <div className="cmd-item__icon">{TYPE_ICON[item.type]}</div>
                  <div className="cmd-item__text" style={{ minWidth: 0, textAlign: 'left' }}>
                    <div className="cmd-item__title">{item.title}</div>
                    <div className="cmd-item__hint" style={{ color: 'var(--color-text-muted)' }}>{item.snippet}</div>
                    {item.path && <div className="cmd-item__hint" style={{ fontSize: 11, fontFamily: 'var(--font-mono)' }}>{item.path}</div>}
                  </div>
                  <IconChevronRight width={16} height={16} style={{ color: 'var(--color-text-subtle)' }} />
                </button>
              ))
            ) : (
              <div style={{ padding: 'var(--space-5)' }}>
                <EmptySearch query={q} onClear={() => setQ('')} />
              </div>
            )}
          </div>
        </div>

        <Separator />
        <div className="panel__footer">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span className="cmd-item__kbd">⌘K</span> open
            <span className="cmd-item__kbd">↵</span> open
            <span className="cmd-item__kbd">esc</span> close
          </div>
          {results ? (
            <span className="muted">{results.total} results · {results.latencyMs}ms</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

const TYPE_ICON: Record<SearchResultItemType, ReactNode> = {
  note: <IconNotes width={16} height={16} />,
  task: <IconTasks width={16} height={16} />,
  project: <IconWorkspace width={16} height={16} />,
  message: <IconChat width={16} height={16} />,
  file: <IconStar width={16} height={16} />,
  tag: <IconStar width={16} height={16} />,
  person: <IconStar width={16} height={16} />,
  command: <IconCommand width={16} height={16} />,
  settings: <IconSettings width={16} height={16} />,
};

/* ─────────────────────────────────────────────────────────────────────────────
 *  AGENT RAIL (right-side panel)
 * ──────────────────────────────────────────────────────────────────────────── */

export function AgentRail({ open, onClose }: { readonly open: boolean; readonly onClose: () => void }) {
  const { list, listRuns } = useAgents();
  const { listMembers, currentWorkspace } = useWorkspace();
  const [agents, setAgents] = useState<readonly Agent[]>([]);
  const [runs, setRuns] = useState<readonly AgentRun[]>([]);
  const [members, setMembers] = useState<readonly WorkspaceMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    void (async () => {
      const [agentsR, runsR] = await Promise.all([
        list({ pageSize: 20 }),
        listRuns({ pageSize: 6 }),
      ]);
      setAgents(agentsR.items);
      setRuns(runsR.items);
      if (currentWorkspace.status === 'success') {
        const m = await listMembers(currentWorkspace.data.id, { pageSize: 10 });
        setMembers(m.items);
      }
      setLoading(false);
    })();
  }, [open, list, listRuns, listMembers, currentWorkspace]);

  if (!open) return null;

  return (
    <aside
      className="panel panel--rail"
      aria-label="Agents and collaborators"
      role="complementary"
    >
      <div className="panel__head">
        <h3 className="panel__title">Agents &amp; Collaborators</h3>
        <button
          type="button"
          className="ui-btn ui-btn--ghost ui-btn--icon"
          onClick={onClose}
          aria-label="Close panel"
          style={{ width: 32, height: 32 }}
        >
          <IconX width={16} height={16} />
        </button>
      </div>

      <div className="panel__body">
        <div className="rail-section">
          <div className="rail-section__head">
            <span className="rail-section__title">Your Agents</span>
            <Badge tone="violet" size="sm">{agents.length} available</Badge>
          </div>
          {loading ? (
            <PageLoader />
          ) : (
            <div className="stack-sm">
              {agents.map((a) => (
                <AgentChipRow key={a.id} agent={a} />
              ))}
            </div>
          )}
        </div>

        <div className="rail-section">
          <div className="rail-section__head"><span className="rail-section__title">Team members</span></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {members.map((m) => (
              <div key={m.id} className="inline-stack">
                <Avatar size="sm" name={m.displayName ?? m.name} tone="teal" />
                <div style={{ minWidth: 0, flex: '1 1 auto' }}>
                  <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {m.displayName ?? m.name}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-subtle)' }}>{m.role} · {m.email}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rail-section">
          <div className="rail-section__head">
            <span className="rail-section__title">Recent agent runs</span>
            <Link to="/agents/runs" style={{ fontSize: 12, textDecoration: 'none' }}>All runs</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {runs.map((r) => (
              <div
                key={r.id}
                style={{
                  padding: 'var(--space-3) var(--space-4)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-surface)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 'var(--space-3)',
                }}
              >
                <div style={{ minWidth: 0, flex: '1 1 auto' }}>
                  <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {r.taskTitle}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-subtle)', marginTop: 2 }}>
                    {new Date(r.startedAt).toLocaleString()}
                  </div>
                </div>
                <Badge tone={runTone(r.status)} size="sm" dot>
                  {capitalize(r.status.replace('-', ' '))}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

function AgentChipRow({ agent }: { readonly agent: Agent }) {
  const tone = agent.status === 'available' ? 'teal' : agent.status === 'busy' ? 'amber' : 'default';
  return (
    <Link
      to={`/agents/${agent.id}`}
      className={`agent-chip`}
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <Avatar size="sm" name={agent.name} tone={tone} />
      <div style={{ flex: '1 1 auto', minWidth: 0 }}>
        <div className="agent-chip__name inline-stack-sm">
          <span>{agent.name}</span>
          <Badge tone={tone === 'teal' ? 'success' : tone === 'amber' ? 'warning' : 'default'} size="sm" dot>
            {capitalize(agent.status)}
          </Badge>
        </div>
        <div className="agent-chip__desc">{agent.description}</div>
      </div>
    </Link>
  );
}

function runTone(s: AgentRun['status']): 'success' | 'danger' | 'info' | 'warning' | 'default' {
  switch (s) {
    case 'success': return 'success';
    case 'error': return 'danger';
    case 'running': return 'info';
    case 'waiting': return 'warning';
    default: return 'default';
  }
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatRelative(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 60000) return 'Just now';
  const mins = Math.round(ms / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}
