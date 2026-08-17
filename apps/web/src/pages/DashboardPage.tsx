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
import { IconBot, IconCheckCircle, IconX } from '@/lib/icons.js';
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
  const [executionDrawerOpen, setExecutionDrawerOpen] = useState(false);

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
        fontFamily: 'var(--font-sans)',
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
          onInspect={() => setExecutionDrawerOpen(true)}
          onApprove={() => setExecutionDrawerOpen(true)}
        />

        {/* Operational Context Title & Mode Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 170, 48, 0.25)', paddingBottom: 14 }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: '0.25em', color: '#885522', marginBottom: 2, fontFamily: 'var(--font-mono)' }}>
              {wsName.toUpperCase()} // OPERATIONAL ENVIRONMENT ({mode.toUpperCase()})
            </div>
            <div style={{ fontSize: 20, fontWeight: 'bold', letterSpacing: '0.02em', color: '#ffaa30', textShadow: '0 0 8px rgba(255, 170, 48, 0.6)', fontFamily: 'var(--font-sans)' }}>
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
            onSelectRun={() => setExecutionDrawerOpen(true)}
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

      {/* Active Agent Execution Drawer */}
      {executionDrawerOpen && (
        <AgentExecutionDrawer
          run={activeRun}
          onClose={() => setExecutionDrawerOpen(false)}
        />
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

function AgentExecutionDrawer({
  run,
  onClose,
}: {
  readonly run: AgentRun | null;
  readonly onClose: () => void;
}) {
  return (
    <div className="task-detail-drawer" style={{ color: '#ffcc66', fontFamily: 'var(--font-sans)' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255, 170, 48, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(14, 7, 1, 0.95)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#ffaa30', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>
          <IconBot width={14} height={14} />
          <span>PLANNER // RUNNING</span>
        </div>
        <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#885522', cursor: 'pointer' }}>
          <IconX width={16} height={16} />
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: '20px', flex: '1 1 auto', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: '0.12em', color: '#885522', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>
            OBJECTIVE
          </div>
          <div style={{ fontSize: 16, fontWeight: 'bold', color: '#ffcc66', lineHeight: 1.4 }}>
            {run?.taskTitle ?? 'Break down Q3 goals into milestones'}
          </div>
        </div>

        {/* Observable Activity Trace Steps */}
        <div>
          <div style={{ fontSize: 10, letterSpacing: '0.12em', color: '#ffaa30', fontWeight: 'bold', fontFamily: 'var(--font-mono)', marginBottom: 10 }}>
            OBSERVABLE EXECUTION STEPS
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontFamily: 'var(--font-mono)', fontSize: 11 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#34d399' }}>
              <IconCheckCircle width={14} height={14} />
              <span>Understand objective &amp; workspace constraints</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#34d399' }}>
              <IconCheckCircle width={14} height={14} />
              <span>Analyze existing tasks &amp; dependency graph</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ffaa30' }}>
              <span className="island-pulse-orb" style={{ width: 6, height: 6 }} />
              <span>Generate milestone timeline &amp; estimates</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#885522' }}>
              <span>○</span>
              <span>Prepare final execution plan for operator review</span>
            </div>
          </div>
        </div>

        {/* Progress Bar & Telemetry */}
        <div style={{ background: 'rgba(20, 10, 2, 0.7)', border: '1px solid rgba(255, 170, 48, 0.2)', borderRadius: 6, padding: '14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
            <span style={{ color: '#885522' }}>PROGRESS</span>
            <span style={{ color: '#ffaa30', fontWeight: 'bold' }}>64%</span>
          </div>
          <div style={{ width: '100%', height: 6, background: 'rgba(255, 170, 48, 0.15)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ width: '64%', height: '100%', background: '#ffaa30' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#885522', fontFamily: 'var(--font-mono)' }}>
            <span>Started 18m ago</span>
            <span>Est. 12m left</span>
          </div>
        </div>
      </div>

      {/* Footer Controls */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255, 170, 48, 0.3)', display: 'flex', gap: 10, background: 'rgba(14, 7, 1, 0.95)' }}>
        <button
          type="button"
          onClick={onClose}
          style={{
            flex: 1,
            background: 'rgba(255, 170, 48, 0.15)',
            border: '1px solid rgba(255, 170, 48, 0.4)',
            borderRadius: 4,
            color: '#ffcc66',
            padding: '8px',
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          PAUSE RUN
        </button>
        <button
          type="button"
          onClick={onClose}
          style={{
            flex: 1,
            background: '#ffaa30',
            border: 'none',
            borderRadius: 4,
            color: '#000000',
            padding: '8px',
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          [ ASK SYNTROPHOS ]
        </button>
      </div>
    </div>
  );
}
