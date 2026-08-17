import { useState } from 'react';
import type { Task } from '@/lib/services/tasks.contract';
import type { CalendarEvent } from '@/lib/services/calendar.contract';
import type { AgentRun } from '@/lib/services/agents.contract';
import type { Note } from '@/lib/services/notes.contract';
import { IconCheckCircle, IconTasks } from '@/lib/icons.js';

export type ContextStreamsProps = {
  readonly activeRuns: readonly AgentRun[];
  readonly todayTasks: readonly Task[];
  readonly events: readonly CalendarEvent[];
  readonly notes: readonly Note[];
  readonly onSelectRun: (run: AgentRun) => void;
  readonly onSelectTask: (task: Task) => void;
  readonly onSelectContextSource: (source: 'gmail' | 'calendar' | 'github' | 'vault' | 'projects') => void;
  readonly onApproveProposedAction?: (actionTitle: string) => void;
  readonly onLetAIHandle?: (taskTitle: string) => void;
  readonly mode?: 'personal' | 'business';
};

export function ContextStreams({
  activeRuns,
  todayTasks,
  events,
  notes,
  onSelectRun,
  onSelectTask,
  onSelectContextSource,
  onApproveProposedAction,
  onLetAIHandle,
  mode = 'personal',
}: ContextStreamsProps) {
  const [expandedRunId, setExpandedRunId] = useState<string | null>(activeRuns[0]?.id ?? null);
  const [approvedActionIds, setApprovedActionIds] = useState<string[]>([]);

  const handleApproveAction = (id: string, title: string) => {
    setApprovedActionIds((prev) => [...prev, id]);
    onApproveProposedAction?.(title);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24, width: '100%', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Left Column: ACTIVE AGENT WORKFLOWS & HUMAN-IN-THE-LOOP PROPOSALS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* 1. SYNTHROPHOS // ACTIVE AGENT ACTIVITY */}
        <div
          style={{
            background: 'rgba(14, 7, 1, 0.9)',
            border: '1px solid rgba(255, 170, 48, 0.35)',
            borderRadius: 10,
            padding: '18px 20px',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 170, 48, 0.12)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, fontWeight: 'bold', color: '#ffaa30', letterSpacing: '0.12em', fontFamily: 'monospace' }}>
              <span className="island-pulse-orb" />
              <span>SYNTHROPHOS // ACTIVE AGENT WORKSPACE</span>
            </div>
            <span className="ai-badge ai-badge--executing">● {activeRuns.length} EXECUTING</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Primary Live Active Agent Tree Item */}
            <div
              style={{
                background: 'rgba(25, 13, 2, 0.65)',
                border: '1px solid rgba(255, 170, 48, 0.3)',
                borderRadius: 8,
                padding: '12px 14px',
                cursor: 'pointer',
                transition: 'all 160ms ease',
              }}
              onClick={() => setExpandedRunId((id) => (id === 'active-main' ? null : 'active-main'))}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="island-pulse-orb" style={{ width: 6, height: 6 }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#ffcc66' }}>
                    Breaking Q3 goals into milestones
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 10, color: '#885522', fontFamily: 'monospace' }}>Agent Planner · Running</span>
                  <span style={{ fontSize: 10, color: '#ffaa30', fontFamily: 'monospace' }}>
                    {expandedRunId === 'active-main' ? '▲ HIDE' : '▼ STEPS'}
                  </span>
                </div>
              </div>

              {/* Sub-step Execution Tree (Progressive Disclosure) */}
              {expandedRunId === 'active-main' && (
                <div
                  style={{
                    marginTop: 12,
                    paddingTop: 10,
                    borderTop: '1px dashed rgba(255, 170, 48, 0.2)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
                    <span className="agent-tree-connector">├─</span>
                    <span style={{ color: '#34d399', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <IconCheckCircle width={11} height={11} />
                      <span>Understanding goal &amp; knowledge scope</span>
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
                    <span className="agent-tree-connector">├─</span>
                    <span style={{ color: '#ffaa30', fontWeight: 'bold' }}>● Creating milestones &amp; dependency graph</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
                    <span className="agent-tree-connector">└─</span>
                    <span style={{ color: '#885522' }}>○ Preparing recommendations for operator review</span>
                  </div>

                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button
                      type="button"
                      onClick={() => onSelectRun(activeRuns[0] ?? ({ id: 'run-1', taskTitle: 'Breaking Q3 goals into milestones', status: 'running', agentId: 'planner' } as AgentRun))}
                      style={{
                        background: 'rgba(255, 170, 48, 0.15)',
                        border: '1px solid rgba(255, 170, 48, 0.4)',
                        borderRadius: 4,
                        color: '#ffcc66',
                        fontSize: 10,
                        fontFamily: 'monospace',
                        padding: '4px 10px',
                        cursor: 'pointer',
                      }}
                    >
                      [ INSPECT FULL TRACE ]
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Additional Active Runs */}
            {activeRuns.slice(1, 3).map((r) => (
              <div
                key={r.id}
                className="operation-stream-item"
                onClick={() => onSelectRun(r)}
                role="button"
                tabIndex={0}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="island-pulse-orb" style={{ width: 6, height: 6 }} />
                  <span style={{ fontSize: 12, color: '#ffcc66' }}>{r.taskTitle}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10, fontFamily: 'monospace' }}>
                  <span style={{ color: '#885522' }}>{r.agentId.toUpperCase()}</span>
                  <span className="ai-badge ai-badge--executing">{r.status.toUpperCase()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. SYNTHROPHOS // HUMAN-IN-THE-LOOP PROPOSED ACTION */}
        <div
          style={{
            background: 'rgba(20, 10, 2, 0.95)',
            border: '1px solid rgba(255, 140, 20, 0.5)',
            borderRadius: 10,
            padding: '18px 20px',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.8), 0 0 20px rgba(255, 140, 20, 0.15)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 'bold', color: '#ffaa30', letterSpacing: '0.1em', fontFamily: 'monospace' }}>
              <span>!</span>
              <span>SYNTHROPHOS // PROPOSED ACTION</span>
            </div>
            <span className="ai-badge ai-badge--proposed">NEEDS APPROVAL</span>
          </div>

          {!approvedActionIds.includes('action-leads') ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 'bold', color: '#ffcc66' }}>
                  {mode === 'business' ? 'Send follow-up to 5 unanswered leads' : 'Consolidate unanswered meeting requests'}
                </div>
                <div style={{ fontSize: 12, color: '#d99a4e', marginTop: 4, lineHeight: 1.5 }}>
                  {mode === 'business'
                    ? 'Syntrophos identified 5 prospective client leads with no response in the last 7 days. AI outreach draft is generated and ready for dispatch.'
                    : 'Found 3 pending calendar invites requiring confirmation and 2 notes needing vault categorization.'}
                </div>
              </div>

              {/* Evidence Snippet */}
              <div className="evidence-container">
                <div style={{ fontSize: 10, color: '#ffaa30', fontFamily: 'monospace', fontWeight: 'bold' }}>
                  EVIDENCE &amp; CONTEXT:
                </div>
                <div style={{ fontSize: 10, color: '#885522', fontFamily: 'monospace', marginTop: 2 }}>
                  Based on: 3 calendar events · 12 relevant emails · Vault note: roadmap-v1.md
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
                <button
                  type="button"
                  onClick={() => onSelectContextSource('gmail')}
                  style={{
                    background: 'rgba(255, 170, 48, 0.12)',
                    border: '1px solid rgba(255, 170, 48, 0.35)',
                    borderRadius: 4,
                    color: '#ffcc66',
                    fontFamily: 'monospace',
                    fontSize: 11,
                    padding: '6px 14px',
                    cursor: 'pointer',
                  }}
                >
                  [ REVIEW ]
                </button>
                <button
                  type="button"
                  onClick={() => handleApproveAction('action-leads', 'Send follow-up to 5 unanswered leads')}
                  style={{
                    background: '#ffaa30',
                    border: 'none',
                    borderRadius: 4,
                    color: '#000000',
                    fontWeight: 'bold',
                    fontFamily: 'monospace',
                    fontSize: 11,
                    padding: '6px 18px',
                    cursor: 'pointer',
                    boxShadow: '0 0 12px rgba(255, 170, 48, 0.4)',
                  }}
                >
                  [ APPROVE &amp; DISPATCH ]
                </button>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: 12, color: '#34d399', fontFamily: 'monospace', padding: '8px 0' }}>
              ✓ PROPOSED ACTION APPROVED &amp; DISPATCHED TO AGENT PIPELINE
            </div>
          )}
        </div>
      </div>

      {/* Right Column: TODAY WORKSPACE & CONTEXT MATRIX */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* 3. TODAY WORKSPACE */}
        <div
          style={{
            background: 'rgba(14, 7, 1, 0.9)',
            border: '1px solid rgba(255, 170, 48, 0.35)',
            borderRadius: 10,
            padding: '18px 20px',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 170, 48, 0.12)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 'bold', color: '#ffaa30', letterSpacing: '0.12em', fontFamily: 'monospace' }}>
              <IconTasks width={14} height={14} />
              <span>TODAY // WORKSPACE</span>
            </div>
            <span style={{ fontSize: 10, color: '#885522', fontFamily: 'monospace' }}>
              3 ITEMS NEED ATTENTION
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Item 1: Q3 Milestones */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                background: 'rgba(25, 13, 2, 0.5)',
                border: '1px solid rgba(255, 170, 48, 0.2)',
                borderRadius: 6,
              }}
            >
              <div>
                <div style={{ fontSize: 12, fontWeight: 'bold', color: '#ffcc66' }}>Q3 Milestones Breakdown</div>
                <div style={{ fontSize: 10, color: '#885522', marginTop: 2, fontFamily: 'monospace' }}>
                  Syntrophos can break this into an execution plan
                </div>
              </div>
              <button
                type="button"
                onClick={() => onLetAIHandle?.('Q3 Milestones Breakdown')}
                style={{
                  background: 'rgba(255, 170, 48, 0.15)',
                  border: '1px solid rgba(255, 170, 48, 0.4)',
                  borderRadius: 4,
                  color: '#ffaa30',
                  fontFamily: 'monospace',
                  fontSize: 10,
                  fontWeight: 'bold',
                  padding: '4px 10px',
                  cursor: 'pointer',
                }}
              >
                [ LET IT HANDLE ]
              </button>
            </div>

            {/* Item 2: Client Meeting Brief */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                background: 'rgba(25, 13, 2, 0.5)',
                border: '1px solid rgba(255, 170, 48, 0.2)',
                borderRadius: 6,
              }}
            >
              <div>
                <div style={{ fontSize: 12, fontWeight: 'bold', color: '#ffcc66' }}>Client Architecture Briefing</div>
                <div style={{ fontSize: 10, color: '#34d399', marginTop: 2, fontFamily: 'monospace' }}>
                  ● AI Briefing compiled &amp; ready
                </div>
              </div>
              <button
                type="button"
                onClick={() => onSelectContextSource('calendar')}
                style={{
                  background: 'rgba(255, 170, 48, 0.15)',
                  border: '1px solid rgba(255, 170, 48, 0.4)',
                  borderRadius: 4,
                  color: '#ffcc66',
                  fontFamily: 'monospace',
                  fontSize: 10,
                  padding: '4px 10px',
                  cursor: 'pointer',
                }}
              >
                [ REVIEW ]
              </button>
            </div>

            {/* Item 3: Evening Review */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                background: 'rgba(25, 13, 2, 0.5)',
                border: '1px solid rgba(255, 170, 48, 0.2)',
                borderRadius: 6,
              }}
            >
              <div>
                <div style={{ fontSize: 12, fontWeight: 'bold', color: '#ffcc66' }}>
                  {mode === 'business' ? 'Operations Sync' : 'Personal Planning'}
                </div>
                <div style={{ fontSize: 10, color: '#885522', marginTop: 2, fontFamily: 'monospace' }}>
                  6:00 PM · Scheduled
                </div>
              </div>
              <button
                type="button"
                onClick={() => onSelectContextSource('calendar')}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255, 170, 48, 0.25)',
                  borderRadius: 4,
                  color: '#d99a4e',
                  fontFamily: 'monospace',
                  fontSize: 10,
                  padding: '4px 10px',
                  cursor: 'pointer',
                }}
              >
                [ OPEN ]
              </button>
            </div>
          </div>
        </div>

        {/* 4. CONTEXT & KNOWLEDGE VAULT MATRIX */}
        <div
          style={{
            background: 'rgba(14, 7, 1, 0.9)',
            border: '1px solid rgba(255, 170, 48, 0.35)',
            borderRadius: 10,
            padding: '18px 20px',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 170, 48, 0.12)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 'bold', color: '#ffaa30', letterSpacing: '0.12em', fontFamily: 'monospace' }}>
              <span>□</span>
              <span>CONTEXT &amp; KNOWLEDGE VAULT</span>
            </div>
            <span style={{ fontSize: 10, color: '#885522', fontFamily: 'monospace' }}>
              CLICK SOURCE FOR DRAWER
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            <div
              className="operation-stream-item"
              onClick={() => onSelectContextSource('gmail')}
              role="button"
              tabIndex={0}
            >
              <div>
                <div style={{ fontSize: 10, color: '#885522', fontFamily: 'monospace' }}>GMAIL</div>
                <div style={{ fontSize: 12, fontWeight: 'bold', color: '#ffcc66' }}>12 unread · 3 relevant</div>
                <div style={{ fontSize: 9, color: '#34d399', marginTop: 2 }}>● CONNECTED</div>
              </div>
            </div>

            <div
              className="operation-stream-item"
              onClick={() => onSelectContextSource('calendar')}
              role="button"
              tabIndex={0}
            >
              <div>
                <div style={{ fontSize: 10, color: '#885522', fontFamily: 'monospace' }}>CALENDAR</div>
                <div style={{ fontSize: 12, fontWeight: 'bold', color: '#ffcc66' }}>{events.length} events · 1 conflict</div>
                <div style={{ fontSize: 9, color: '#34d399', marginTop: 2 }}>● SYNCED</div>
              </div>
            </div>

            <div
              className="operation-stream-item"
              onClick={() => onSelectContextSource('vault')}
              role="button"
              tabIndex={0}
            >
              <div>
                <div style={{ fontSize: 10, color: '#885522', fontFamily: 'monospace' }}>OBSIDIAN VAULT</div>
                <div style={{ fontSize: 12, fontWeight: 'bold', color: '#ffcc66' }}>{notes.length} indexed nodes</div>
                <div style={{ fontSize: 9, color: '#34d399', marginTop: 2 }}>● INDEXED</div>
              </div>
            </div>

            <div
              className="operation-stream-item"
              onClick={() => onSelectContextSource('projects')}
              role="button"
              tabIndex={0}
            >
              <div>
                <div style={{ fontSize: 10, color: '#885522', fontFamily: 'monospace' }}>PROJECTS</div>
                <div style={{ fontSize: 12, fontWeight: 'bold', color: '#ffcc66' }}>3 active pipelines</div>
                <div style={{ fontSize: 9, color: '#ffaa30', marginTop: 2 }}>● TRACKING</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
