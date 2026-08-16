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

  const commands = useMemo<Command[]>(() => {
    return [
      { id: 'nav-home', group: 'Navigate', title: 'Go to Dashboard', icon: <IconDashboard width={16} height={16} />, shortcut: 'G H', run: () => navigate('/') },
      { id: 'nav-chat', group: 'Navigate', title: 'Go to Chat', hint: 'Open AI chat workspace', icon: <IconChat width={16} height={16} />, shortcut: 'G C', run: () => navigate('/chat') },
      { id: 'nav-notes', group: 'Navigate', title: 'Go to Notes', icon: <IconNotes width={16} height={16} />, shortcut: 'G N', run: () => navigate('/notes') },
      { id: 'nav-tasks', group: 'Navigate', title: 'Go to Tasks', icon: <IconTasks width={16} height={16} />, shortcut: 'G T', run: () => navigate('/tasks') },
      { id: 'nav-calendar', group: 'Navigate', title: 'Go to Calendar', icon: <IconCalendar width={16} height={16} />, run: () => navigate('/calendar') },
      { id: 'nav-agents', group: 'Navigate', title: 'Go to Agents', icon: <IconBot width={16} height={16} />, run: () => navigate('/agents') },
      { id: 'nav-integrations', group: 'Navigate', title: 'Go to Integrations', icon: <IconIntegration width={16} height={16} />, run: () => navigate('/integrations') },
      { id: 'nav-plugins', group: 'Navigate', title: 'Go to Plugins', icon: <IconPlugin width={16} height={16} />, run: () => navigate('/plugins') },
      { id: 'nav-providers', group: 'Navigate', title: 'Manage AI Providers', icon: <IconProviders width={16} height={16} />, run: () => navigate('/settings/providers') },
      { id: 'nav-workspaces', group: 'Navigate', title: 'Manage Workspaces', icon: <IconWorkspace width={16} height={16} />, run: () => navigate('/workspaces') },
      { id: 'nav-settings', group: 'Navigate', title: 'Open Settings', icon: <IconSettings width={16} height={16} />, shortcut: ',', run: () => navigate('/settings') },
      { id: 'nav-starred', group: 'Navigate', title: 'Go to Starred', icon: <IconStar width={16} height={16} />, run: () => navigate('/starred') },
      { id: 'action-new-chat', group: 'Actions', title: 'Start new conversation', icon: <IconChat width={16} height={16} />, run: () => navigate('/chat/new') },
      { id: 'action-new-note', group: 'Actions', title: 'Create new note', icon: <IconNotes width={16} height={16} />, shortcut: 'N', run: () => navigate('/notes/new') },
      { id: 'action-new-task', group: 'Actions', title: 'Create new task', icon: <IconTasks width={16} height={16} />, shortcut: 'T', run: () => navigate('/tasks?new=1') },
    ];
  }, [navigate]);

  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter((c) => c.title.toLowerCase().includes(q) || c.group.toLowerCase().includes(q));
  }, [commands, query]);

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

  const groups = filtered.reduce<Record<string, Command[]>>((acc, cur) => {
    (acc[cur.group] = acc[cur.group] ?? []).push(cur);
    return acc;
  }, {});

  return (
    <>
      <div className="panel-scrim" onClick={onClose} />
      <div className="panel panel--command" role="dialog" aria-modal="true" aria-label="Command palette">
        <div className="cmd-input-wrap">
          <IconSearch width={18} height={18} style={{ color: 'var(--color-text-muted)' }} />
          <input
            ref={inputRef}
            className="cmd-input"
            placeholder="Type a command or search…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKey}
            aria-label="Search commands"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
          />
          <IconCommand width={16} height={16} style={{ color: 'var(--color-text-subtle)' }} />
        </div>

        <div className="panel__body" style={{ padding: 0 }}>
          {filtered.length === 0 ? (
            <div style={{ padding: 'var(--space-8)' }}>
              <EmptySearch query={query} onClear={() => setQuery('')} />
            </div>
          ) : (
            Object.entries(groups).map(([group, items]) => (
              <div key={group}>
                <div className="cmd-group-title">{group}</div>
                {items.map((c) => {
                  const globalIdx = filtered.indexOf(c);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      className="cmd-item"
                      data-active={globalIdx === activeIdx || undefined}
                      role="option"
                      aria-selected={globalIdx === activeIdx}
                      onMouseEnter={() => setActiveIdx(globalIdx)}
                      onClick={() => { c.run(); onClose(); }}
                    >
                      <div className="cmd-item__icon">{c.icon}</div>
                      <div className="cmd-item__text">
                        <div className="cmd-item__title">{c.title}</div>
                        {c.hint && <div className="cmd-item__hint">{c.hint}</div>}
                      </div>
                      {c.shortcut && <span className="cmd-item__kbd">{c.shortcut}</span>}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <div className="panel__footer">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span className="cmd-item__kbd">↑↓</span> navigate
            <span className="cmd-item__kbd">↵</span> run
            <span className="cmd-item__kbd">esc</span> close
          </div>
          <span className="muted">Syntrophos commands</span>
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
