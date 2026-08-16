import { Link } from 'react-router-dom';
import type { Task } from '@/lib/services/tasks.contract';
import type { CalendarEvent } from '@/lib/services/calendar.contract';
import type { AgentRun } from '@/lib/services/agents.contract';
import type { Note } from '@/lib/services/notes.contract';

export type ContextStreamsProps = {
  readonly activeRuns: readonly AgentRun[];
  readonly todayTasks: readonly Task[];
  readonly events: readonly CalendarEvent[];
  readonly notes: readonly Note[];
  readonly onSelectRun: (run: AgentRun) => void;
  readonly onSelectTask: (task: Task) => void;
};

export function ContextStreams({
  activeRuns,
  todayTasks,
  events,
  notes,
  onSelectRun,
  onSelectTask,
}: ContextStreamsProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24, width: '100%', maxWidth: '1080px', margin: '0 auto' }}>
      {/* Left Column: ACTIVE NOW & LIVE WORKFLOWS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Active Operations */}
        <div
          style={{
            background: 'rgba(16, 9, 2, 0.75)',
            border: '1px solid rgba(255, 170, 48, 0.3)',
            borderRadius: 8,
            padding: '16px 18px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 170, 48, 0.1)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 'bold', color: '#ffaa30', letterSpacing: '0.12em', fontFamily: 'monospace' }}>
              <span>●</span>
              <span>ACTIVE NOW // WORKSPACE STREAMS</span>
            </div>
            <Link to="/agents" style={{ textDecoration: 'none', color: '#885522', fontSize: 10, fontFamily: 'monospace' }}>
              [ALL AGENTS]
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {activeRuns.length > 0 ? (
              activeRuns.map((r) => (
                <div
                  key={r.id}
                  className="operation-stream-item"
                  onClick={() => onSelectRun(r)}
                  role="button"
                  tabIndex={0}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className="island-pulse-orb" style={{ width: 6, height: 6 }} />
                    <span style={{ fontSize: 12, color: '#ffcc66', fontWeight: 500 }}>{r.taskTitle}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10, fontFamily: 'monospace' }}>
                    <span style={{ color: '#885522' }}>{r.agentId.toUpperCase()}</span>
                    <span style={{ color: r.status === 'success' ? '#34d399' : '#ffaa30' }}>
                      [{r.status.toUpperCase()}]
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div
                className="operation-stream-item"
                style={{ cursor: 'default' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#885522' }}>●</span>
                  <span style={{ fontSize: 12, color: '#885522' }}>Neural observation mode active. No autonomous tasks in pipeline.</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Deliverables / Priority Horizon */}
        <div
          style={{
            background: 'rgba(16, 9, 2, 0.75)',
            border: '1px solid rgba(255, 170, 48, 0.3)',
            borderRadius: 8,
            padding: '16px 18px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 170, 48, 0.1)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 'bold', color: '#ffaa30', letterSpacing: '0.12em', fontFamily: 'monospace' }}>
              <span>✓</span>
              <span>TODAY’S DELIVERABLES</span>
            </div>
            <Link to="/tasks" style={{ textDecoration: 'none', color: '#885522', fontSize: 10, fontFamily: 'monospace' }}>
              [MANAGE TASKS]
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {todayTasks.slice(0, 5).map((t, idx) => (
              <div
                key={t.id}
                className="operation-stream-item"
                onClick={() => onSelectTask(t)}
                role="button"
                tabIndex={0}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ color: '#885522', fontSize: 10, fontFamily: 'monospace' }}>0{idx + 1}</span>
                  <span style={{ fontSize: 12, color: '#ffcc66' }}>{t.title}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10, fontFamily: 'monospace' }}>
                  {t.priority === 'urgent' && <span style={{ color: '#ff5533' }}>[URGENT]</span>}
                  <span style={{ color: t.status === 'done' ? '#34d399' : '#ffaa30' }}>
                    {t.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column: YOUR DAY & CONTEXT SOURCES */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Your Day Temporal Timeline */}
        <div
          style={{
            background: 'rgba(16, 9, 2, 0.75)',
            border: '1px solid rgba(255, 170, 48, 0.3)',
            borderRadius: 8,
            padding: '16px 18px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 170, 48, 0.1)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 'bold', color: '#ffaa30', letterSpacing: '0.12em', fontFamily: 'monospace' }}>
              <span>◷</span>
              <span>YOUR DAY // SCHEDULE</span>
            </div>
            <Link to="/calendar" style={{ textDecoration: 'none', color: '#885522', fontSize: 10, fontFamily: 'monospace' }}>
              [CALENDAR]
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {events.length > 0 ? (
              events.slice(0, 4).map((e) => (
                <div
                  key={e.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    background: 'rgba(25, 13, 2, 0.45)',
                    border: '1px solid rgba(255, 170, 48, 0.15)',
                    borderRadius: 4,
                    fontSize: 12,
                    color: '#ffcc66',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ color: '#ffaa30', fontSize: 11 }}>◷</span>
                    <span>{e.title}</span>
                  </div>
                  <span style={{ color: '#885522', fontSize: 10, fontFamily: 'monospace' }}>
                    {e.startAt ? new Date(e.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'ALL DAY'}
                  </span>
                </div>
              ))
            ) : (
              <div style={{ color: '#885522', fontSize: 11, fontFamily: 'monospace', padding: 8 }}>
                NO UPCOMING EVENTS SCHEDULED FOR TODAY
              </div>
            )}
          </div>
        </div>

        {/* Knowledge & Context Vault Summary */}
        <div
          style={{
            background: 'rgba(16, 9, 2, 0.75)',
            border: '1px solid rgba(255, 170, 48, 0.3)',
            borderRadius: 8,
            padding: '16px 18px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 170, 48, 0.1)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 'bold', color: '#ffaa30', letterSpacing: '0.12em', fontFamily: 'monospace' }}>
              <span>□</span>
              <span>CONTEXT &amp; KNOWLEDGE VAULT</span>
            </div>
            <Link to="/notes" style={{ textDecoration: 'none', color: '#885522', fontSize: 10, fontFamily: 'monospace' }}>
              [{notes.length} NODES]
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            <ContextItem label="GMAIL FEED" value="12 UNREAD" status="CONNECTED" />
            <ContextItem label="CALENDAR" value={`${events.length} EVENTS`} status="SYNCED" />
            <ContextItem label="GITHUB" value="MAIN BRANCH" status="TRACKING" />
            <ContextItem label="VAULT" value={`${notes.length} NOTES`} status="INDEXED" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ContextItem({
  label,
  value,
  status,
}: {
  readonly label: string;
  readonly value: string;
  readonly status: string;
}) {
  return (
    <div
      style={{
        padding: '8px 10px',
        background: 'rgba(25, 13, 2, 0.45)',
        border: '1px solid rgba(255, 170, 48, 0.15)',
        borderRadius: 4,
      }}
    >
      <div style={{ fontSize: 9, color: '#885522', fontFamily: 'monospace', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 11, fontWeight: 'bold', color: '#ffcc66' }}>{value}</div>
      <div style={{ fontSize: 9, color: '#34d399', marginTop: 2 }}>● {status}</div>
    </div>
  );
}
