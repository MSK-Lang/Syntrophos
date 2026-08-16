import { useState } from 'react';
import type { AgentRun } from '@/lib/services/agents.contract';

export type DynamicIslandState = 'idle' | 'running' | 'waiting' | 'completed';

export type DynamicIslandProps = {
  readonly activeRun?: AgentRun | null;
  readonly progress?: number;
  readonly onInspect?: (run: AgentRun) => void;
  readonly onApprove?: (run: AgentRun) => void;
};

export function DynamicIsland({
  activeRun,
  progress = 42,
  onInspect,
  onApprove,
}: DynamicIslandProps) {
  const [expanded, setExpanded] = useState(false);

  const state: DynamicIslandState = activeRun
    ? activeRun.status === 'running'
      ? 'running'
      : activeRun.status === 'waiting'
        ? 'waiting'
        : 'completed'
    : 'idle';

  return (
    <div style={{ display: 'flex', justifyContent: 'center', width: '100%', position: 'relative', zIndex: 30 }}>
      <div
        className={`dynamic-island-container ${expanded ? 'dynamic-island-container--expanded' : ''}`}
        onClick={() => setExpanded((v) => !v)}
      >
        {!expanded ? (
          /* Compact Island Pill */
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, fontFamily: 'monospace' }}>
            <span
              className={`island-pulse-orb ${
                state === 'running'
                  ? ''
                  : state === 'waiting'
                    ? 'island-pulse-orb--alert'
                    : state === 'completed'
                      ? 'island-pulse-orb--success'
                      : 'island-pulse-orb--idle'
              }`}
            />
            {state === 'running' && activeRun ? (
              <span style={{ color: '#ffcc66', letterSpacing: '0.06em' }}>
                <strong style={{ color: '#ffaa30' }}>RUNNING:</strong> {activeRun.taskTitle} · {progress}%
              </span>
            ) : state === 'waiting' && activeRun ? (
              <span style={{ color: '#ffcc66', letterSpacing: '0.06em' }}>
                <strong style={{ color: '#ff5533' }}>WAITING APPROVAL:</strong> {activeRun.taskTitle}
              </span>
            ) : state === 'completed' && activeRun ? (
              <span style={{ color: '#ffcc66', letterSpacing: '0.06em' }}>
                <strong style={{ color: '#34d399' }}>✓ COMPLETE:</strong> {activeRun.taskTitle}
              </span>
            ) : (
              <span style={{ color: '#d99a4e', letterSpacing: '0.12em' }}>
                <strong style={{ color: '#ffaa30' }}>SYNTHROPHOS</strong> // ALL SUBSYSTEMS NOMINAL
              </span>
            )}
            <span style={{ color: '#885522', fontSize: 10, marginLeft: 4 }}>▾</span>
          </div>
        ) : (
          /* Expanded Activity Inspector */
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="island-pulse-orb" />
                <span style={{ fontSize: 12, fontWeight: 'bold', color: '#ffaa30', letterSpacing: '0.1em', fontFamily: 'monospace' }}>
                  SYNTHROPHOS LIVE ACTIVITY
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpanded(false);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#885522',
                  fontSize: 12,
                  cursor: 'pointer',
                  padding: '2px 6px',
                }}
              >
                ✕ CLOSE
              </button>
            </div>

            {activeRun ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#ffcc66' }}>
                  {activeRun.taskTitle}
                </div>

                {/* Step Pipeline Execution */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11, fontFamily: 'monospace' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#34d399' }}>
                    <span>✓</span>
                    <span>SEARCH WORKSPACE CONTEXT &amp; GMAIL</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#34d399' }}>
                    <span>✓</span>
                    <span>INDEX RECENT KNOWLEDGE VAULT NODES</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ffaa30' }}>
                    <span className="island-pulse-orb" style={{ width: 6, height: 6 }} />
                    <span>SYNTHESIZING CLIENT BRIEF &amp; CODE ARCHITECTURE</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#885522' }}>
                    <span>○</span>
                    <span>AWAITING OPERATOR FINAL CONFIRMATION</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (activeRun && onInspect) onInspect(activeRun);
                    }}
                    style={{
                      background: 'rgba(255, 170, 48, 0.15)',
                      border: '1px solid rgba(255, 170, 48, 0.4)',
                      borderRadius: 4,
                      color: '#ffcc66',
                      padding: '5px 12px',
                      fontSize: 11,
                      fontFamily: 'monospace',
                      cursor: 'pointer',
                    }}
                  >
                    INSPECT STEP DETAILS
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (activeRun && onApprove) onApprove(activeRun);
                    }}
                    style={{
                      background: '#ffaa30',
                      border: 'none',
                      borderRadius: 4,
                      color: '#000000',
                      fontWeight: 'bold',
                      padding: '5px 14px',
                      fontSize: 11,
                      fontFamily: 'monospace',
                      cursor: 'pointer',
                    }}
                  >
                    APPROVE EXECUTION
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: 12, color: '#d99a4e', lineHeight: 1.6 }}>
                Syntrophos is actively monitoring background streams. No manual approvals required at this time.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
