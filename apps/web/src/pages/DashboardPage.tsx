import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useAgents,
  useAuth,
  useNotes,
  useTasks,
  useCalendar,
  useChat,
  useWorkspace,
} from '@/lib/services/index.js';
import { ErrorState, PageLoader } from '@/components/ui/states.js';
import { DynamicIsland } from '@/components/ui/DynamicIsland';
import { CommandCenter } from '@/components/dashboard/CommandCenter';
import { ContextStreams } from '@/components/dashboard/ContextStreams';
import { ActionFloatingBar } from '@/components/dashboard/ActionFloatingBar';
import { MorphingDetailModal } from '@/components/dashboard/MorphingDetailModal';
import { ContextDrawerModal, type ContextSourceType } from '@/components/dashboard/ContextDrawerModal';
import type { Task } from '@/lib/services/tasks.contract.js';
import type { Note } from '@/lib/services/notes.contract.js';
import type { Agent, AgentRun } from '@/lib/services/agents.contract.js';
import type { CalendarEvent } from '@/lib/services/calendar.contract.js';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { listTasks, getOverdue, getToday, createTask } = useTasks();
  const { list: listNotes, create: createNote } = useNotes();
  const { listConversations } = useChat();
  const { list: listAgents, listRuns, listWorkflows, runWorkflow } = useAgents();
  const { listEvents } = useCalendar();
  const { currentWorkspace } = useWorkspace();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const [mode, setMode] = useState<'personal' | 'business'>('personal');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [runs, setRuns] = useState<AgentRun[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  const [inspectItem, setInspectItem] = useState<AgentRun | Task | null>(null);
  const [contextSource, setContextSource] = useState<ContextSourceType>(null);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      try {
        setLoading(true);
        const [t, tod, ov, n, c, a, r, ev] = await Promise.all([
          listTasks({ pageSize: 50 }),
          getToday?.() ?? Promise.resolve([] as unknown as { items: Task[] }),
          getOverdue?.() ?? Promise.resolve([] as unknown as { items: Task[] }),
          listNotes({ pageSize: 10 }),
          listConversations({ pageSize: 6 }),
          listAgents({ pageSize: 10 }),
          listRuns?.({ pageSize: 10 }) ?? Promise.resolve({ items: [] as AgentRun[] }),
          listEvents?.({
            startAt: new Date(Date.now() - 7 * 86400_000).toISOString(),
            endAt: new Date(Date.now() + 7 * 86400_000).toISOString(),
          }) ?? Promise.resolve([] as unknown as { items: CalendarEvent[] }),
        ]);
        if (!mounted) return;
        setTasks(t.items as Task[]);
        const combinedToday = [
          ...((Array.isArray(tod) ? tod : tod.items ?? []) as Task[]),
          ...((Array.isArray(ov) ? ov : ov.items ?? []) as Task[]),
        ];
        setTodayTasks(combinedToday.filter((item, idx, arr) => arr.findIndex((x) => x.id === item.id) === idx));
        setNotes(n.items as Note[]);
        setAgents(a.items as Agent[]);
        setRuns((r.items ?? []) as AgentRun[]);
        setEvents((Array.isArray(ev) ? ev : ev.items ?? []) as CalendarEvent[]);
      } catch (err) {
        if (mounted) setError(err as Error);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [listTasks, listNotes, listConversations, listAgents, listRuns, listEvents, getToday, getOverdue]);

  const handleCommandExecute = async (prompt: string, directive?: string) => {
    if (directive === 'task') {
      await createTask({
        title: prompt,
        priority: 'high',
        status: 'todo',
        tags: ['command-center'],
      });
      const t = await listTasks({ pageSize: 50 });
      setTasks(t.items as Task[]);
    } else if (directive === 'research' || directive === 'email' || directive === 'agent') {
      try {
        const workflows = await listWorkflows?.({ pageSize: 5 });
        if (workflows?.items?.[0] && runWorkflow) {
          await runWorkflow(workflows.items[0].id, { prompt });
          const r = await listRuns?.({ pageSize: 10 });
          if (r?.items) setRuns(r.items as AgentRun[]);
        } else {
          navigate(`/chat/new?prompt=${encodeURIComponent(prompt)}`);
        }
      } catch {
        navigate(`/chat/new?prompt=${encodeURIComponent(prompt)}`);
      }
    } else {
      navigate(`/chat/new?prompt=${encodeURIComponent(prompt)}`);
    }
  };

  const handleQuickTask = async () => {
    const title = window.prompt('Enter new deliverable title:');
    if (!title) return;
    await createTask({ title, priority: 'medium', status: 'todo' });
    const t = await listTasks({ pageSize: 50 });
    setTasks(t.items as Task[]);
  };

  const handleQuickNote = async () => {
    const title = window.prompt('Enter new note title:');
    if (!title) return;
    await createNote({
      path: `notes/${Date.now()}.md`,
      title,
      content: '',
      frontmatter: { status: 'draft', tags: [] },
    });
    const n = await listNotes({ pageSize: 10 });
    setNotes(n.items as Note[]);
  };

  const activeRun = runs.find((r) => r.status === 'running' || r.status === 'waiting') ?? runs[0] ?? null;
  const wsName = currentWorkspace.status === 'success' ? currentWorkspace.data.settings.name : 'SYNTHROPHOS';

  return (
    <div
      style={{
        minHeight: '100%',
        background: '#000000',
        color: '#ffcc66',
        fontFamily: '"Courier New", monospace, sans-serif',
        padding: '28px 36px 90px 36px',
        position: 'relative',
      }}
    >
      {/* Subtle Scanline Overlay */}
      <div
        className="overlay-scanlines"
        style={{ position: 'absolute', pointerEvents: 'none', opacity: 0.15 }}
      />

      {/* Top Header Strip with Dynamic Island */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 28 }}>
        {/* Dynamic Island Live Activity */}
        <DynamicIsland
          activeRun={activeRun}
          progress={64}
          onInspect={(r) => setInspectItem(r)}
          onApprove={(r) => {
            setInspectItem(r);
          }}
        />

        {/* Operational Context Title & Mode Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 170, 48, 0.25)', paddingBottom: 14 }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: '0.25em', color: '#885522', marginBottom: 2 }}>
              {wsName.toUpperCase()} // OPERATIONAL ENVIRONMENT ({mode.toUpperCase()})
            </div>
            <div style={{ fontSize: 18, fontWeight: 'bold', letterSpacing: '0.12em', color: '#ffaa30', textShadow: '0 0 8px rgba(255, 170, 48, 0.6)' }}>
              Good evening, {user?.displayName ?? user?.name ?? 'Operator'}.
            </div>
          </div>

          {/* Mode Switcher Tabs (Personal | Business) */}
          <div style={{ display: 'inline-flex', padding: 3, background: 'rgba(20, 10, 2, 0.8)', border: '1px solid rgba(255, 170, 48, 0.3)', borderRadius: 9999 }}>
            <button
              type="button"
              onClick={() => setMode('personal')}
              className={`mode-switcher-tab ${mode === 'personal' ? 'mode-switcher-tab--active' : ''}`}
            >
              PERSONAL
            </button>
            <button
              type="button"
              onClick={() => setMode('business')}
              className={`mode-switcher-tab ${mode === 'business' ? 'mode-switcher-tab--active' : ''}`}
            >
              BUSINESS
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center' }}>
          <PageLoader label="INITIALIZING OPERATIONAL MATRIX…" />
        </div>
      ) : error ? (
        <ErrorState title="DASHBOARD ERROR" error={error.message} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {/* Central Command Center */}
          <CommandCenter onExecute={handleCommandExecute} mode={mode} />

          {/* Operational Context Streams */}
          <ContextStreams
            mode={mode}
            activeRuns={runs}
            todayTasks={todayTasks.length > 0 ? todayTasks : tasks}
            events={events}
            notes={notes}
            onSelectRun={(r) => setInspectItem(r)}
            onSelectTask={(t) => setInspectItem(t)}
            onSelectContextSource={(source) => setContextSource(source)}
            onApproveProposedAction={(title) => {
              void handleCommandExecute(`Approved proposed action: ${title}`, 'agent');
            }}
            onLetAIHandle={(title) => {
              void handleCommandExecute(`Break down and execute plan for: ${title}`, 'task');
            }}
          />
        </div>
      )}

      {/* Context Source Inspection Drawer */}
      <ContextDrawerModal
        sourceType={contextSource}
        onClose={() => setContextSource(null)}
        events={events}
        notes={notes}
        onExecuteAction={handleCommandExecute}
      />

      {/* Morphing Detail Modal */}
      <MorphingDetailModal
        item={inspectItem}
        onClose={() => setInspectItem(null)}
        onAction={() => {
          setInspectItem(null);
        }}
      />

      {/* Expandable Action Floating Bar */}
      <ActionFloatingBar
        onQuickTask={handleQuickTask}
        onQuickNote={handleQuickNote}
        onQuickAgent={() => navigate('/agents')}
      />
    </div>
  );
}
